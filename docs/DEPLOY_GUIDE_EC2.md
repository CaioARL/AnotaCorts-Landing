# 🚀 Guia de Deploy: Landing Page AnotaCorts na EC2

> [!NOTE]
> Este guia foca apenas no deploy da **Landing Page**. Se você está subindo tudo do zero (Backend + Landing Page juntos), consulte o guia completo no Backend: [FULL_STACK_DEPLOY_GUIDE.md](../../AnotaCorts-Backend/docs/FULL_STACK_DEPLOY_GUIDE.md)

---

## 🏗️ Como Funciona

A Landing Page roda como um container Docker separado do Backend, **sem conflitos de porta**:

```
Cloudflare (HTTPS) → Nginx EC2 (443/80)
    ├── /              → Container anota-corts-landing  (porta 4000)
    └── /anota-corts/  → Container anota-corts-app      (porta 3000)
```

---

## 🛠️ Pré-requisito: EC2 Já Configurada

Este guia assume que a EC2 já foi provisionada pelo Backend (Terraform) e que o Nginx já está rodando. Caso contrário, siga o [FULL_STACK_DEPLOY_GUIDE.md](../../AnotaCorts-Backend/docs/FULL_STACK_DEPLOY_GUIDE.md) antes de continuar.

---

## 📋 Passo 1: Criar o Repositório ECR

Na sua máquina local, crie o repositório para as imagens da Landing Page:

```bash
aws ecr create-repository --repository-name anota-corts-landing --region us-east-1
```

---

## 📋 Passo 2: Criar o Script de Deploy na EC2

Conecte-se à EC2:
```bash
ssh -i anota-corts-key.pem ec2-user@<SEU_ELASTIC_IP>
```

Crie o script de deploy:
```bash
sudo tee /usr/local/bin/deploy-frontend.sh > /dev/null << 'EOF'
#!/bin/bash
IMAGE_NAME=$1
IMAGE_TAG=$2
AWS_REGION=$3
CONTAINER_NAME=$4

echo "--- Iniciando Deploy da Landing Page ---"

# 1. Login no ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $(echo $IMAGE_NAME | cut -d'/' -f1)

# 2. Parar e remover container antigo
echo "Parando container antigo: $CONTAINER_NAME"
docker stop $CONTAINER_NAME || true
docker rm $CONTAINER_NAME || true

# 3. Puxar nova imagem e rodar na porta 4000 (o Nginx externo já cuida do 80/443)
echo "Rodando nova imagem: $IMAGE_NAME:$IMAGE_TAG"
docker run -d \
  --name $CONTAINER_NAME \
  --restart always \
  -p 4000:80 \
  $IMAGE_NAME:$IMAGE_TAG

# 4. Limpeza de imagens antigas
docker image prune -a -f

echo "✅ Deploy da Landing Page concluído!"
EOF

sudo chmod +x /usr/local/bin/deploy-frontend.sh
```

---

## 📋 Passo 3: Configurar o Nginx (se ainda não feito)

> [!WARNING]
> **Não pule este passo!** Se o `app.conf` do Nginx ainda apontar porta 80→3000 sem a rota da `/`, a Landing Page nunca será exibida.

```bash
sudo tee /etc/nginx/conf.d/app.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name anotacorts.com.br;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Landing Page
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /anota-corts/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
EOF

sudo nginx -t && sudo systemctl reload nginx
```

---

## 🔑 Passo 4: Configuração dos GitHub Secrets

No repositório **AnotaCorts-Landing**, vá em **Settings → Secrets and variables → Actions**:

| Secret | Descrição |
|---|---|
| `AWS_ACCESS_KEY_ID` | Chave do usuário IAM `anota-corts-deployer` |
| `AWS_SECRET_ACCESS_KEY` | Secret do usuário IAM `anota-corts-deployer` |
| `EC2_INSTANCE_ID` | ID da instância EC2 (ex: `i-0a1b2c3d4e5f6g7h8`) |

> [!TIP]
> São os **mesmos secrets** já usados no repositório do Backend. Não precisa criar um usuário diferente.

---

## 🏗️ Passo 5: Executar o Deploy

```bash
git add .
git commit -m "feat: setup docker deployment for ec2"
git push origin main
```

Acompanhe o processo em **Actions** no seu repositório do GitHub.

---

## ✅ Verificação

Após o workflow terminar com ✅:

1. Acesse **`https://anotacorts.com.br`** → Landing Page deve carregar
2. Acesse **`https://anotacorts.com.br/anota-corts/actuator/health`** → Backend deve retornar `{"status":"UP"}`
3. Na EC2, valide com: `docker ps` → você deve ver **dois containers** rodando

---

## ❓ Troubleshooting

| Problema | Solução |
|---|---|
| **521 Web server is down (Cloudflare)** | Rode `sudo certbot --nginx -d anotacorts.com.br --non-interactive --agree-tos -m seu@email.com` |
| **Container não aparece no `docker ps`** | `docker ps -a` para ver o status e `docker logs anota-corts-landing` para ver erros |
| **ECR Access Denied** | `aws iam attach-role-policy --role-name anota-corts-ec2-role --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly` |
| **Backend parou de responder** | O Nginx foi reconfigurado? Verifique se a rota `/anota-corts/` ainda está no `app.conf` |

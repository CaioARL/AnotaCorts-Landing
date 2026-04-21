# AnotaCorts - Landing Page (Web)

Landing page responsiva para o ecossistema AnotaCorts, construída com Angular.

## 🚀 Tecnologias

- **Angular 19+**
- **Vanilla CSS** (Design System customizado)
- **Glassmorphism Design**
- **GitHub Actions** (CI/CD)

## 📦 Como rodar localmente

1. **Instale as dependências**:
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm start
   ```
   Acesse `http://localhost:4200`

3. **Build para produção**:
   ```bash
   npm run build
   ```

## 🚀 Deployment

O projeto possui CI/CD configurado via GitHub Actions em `.github/workflows/deploy.yml`. 
O deploy é realizado via **AWS ECR (Docker)** e o acesso externo é gerenciado pelo **Cloudflare Tunnel**.

### Secrets Necessários no GitHub:
- `AWS_ACCESS_KEY_ID`: Chave de acesso AWS.
- `AWS_SECRET_ACCESS_KEY`: Chave secreta AWS.
- `EC2_INSTANCE_ID`: ID da instância EC2.
- `AWS_REGION`: Região da AWS (padrão `us-east-1`).

## 🎨 Design

O design utiliza uma paleta moderna baseada em tons escuros (`#0f172a`), com acentos em Azul (`#3b82f6`) e efeitos de vidro (Glassmorphism).

---

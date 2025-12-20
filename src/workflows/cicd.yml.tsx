name: Commerce CI/CD Deployment

on:
  push:
    branches: [ production ]

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    steps:
      - name: executing remote ssh commands using ssh-key
        uses: appleboy/ssh-action@v0.1.10
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/pretest/frontend
            git pull
            npm run build
            systemctl restart nginx

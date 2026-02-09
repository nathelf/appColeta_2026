# Como Reiniciar o Cloudflare Tunnel para a Porta 3001

## Problema
O tunnel Cloudflare estava apontando para `localhost:8080` (Vite em dev), mas agora o backend Express está servindo tanto o frontend quanto a API na porta 3001.

## Solução

### 1. Parar o tunnel atual (se estiver rodando)
```bash
# Se estiver rodando em um terminal, pressione Ctrl+C
```

### 2. Reiniciar o tunnel apontando para a porta 3001
```bash
# Windows
cloudflare tunnel run appcoleta-tunnel --url http://localhost:3001

# Ou com arquivo de configuração (se criou ~/.cloudflared/config.yml)
cloudflare tunnel run appcoleta-tunnel
```

### 3. Verificar se está funcionando
- Acesse: https://situations-volunteers-methodology-demands.trycloudflare.com
- Você deve ver o login do AppColeta

## Confirmação
✅ Backend rodando na porta 3001
✅ Frontend estático servido pelo backend
✅ API (/sync, /auth) respondendo na mesma origin
✅ Tunnel deve apontar para 3001

## Troubleshooting
Se ainda não funcionar:
1. Verifique o comando do tunnel no seu terminal
2. Confirme que `http://localhost:3001` está respondendo localmente
3. Restart o tunnel com Ctrl+C e execute novamente

# Muxima Bet — Webhook de confirmação de depósitos (Kintu)

## O que é

Quando um lead paga um dos produtos na Kintu, a plataforma chama este webhook e o
saldo (valor + bónus) é creditado automaticamente no perfil do lead no Supabase.

## URL do webhook (colocar nos produtos da Kintu)

Projecto Supabase: **kypohaagiozofdoadvgu** (kibisno.ao@gmail.com)

```
https://kypohaagiozofdoadvgu.supabase.co/functions/v1/kintu-webhook?secret=12b764d47c3cbbd1996e4029fea5e7294a9b027ec341580e
```

### Recomendado — uma URL por produto (força o pacote e o bónus)

Cola a URL correspondente no campo de webhook/notificação de cada produto na Kintu.
Assim o crédito é sempre exacto mesmo que a Kintu não envie o ID do produto:

| Produto (Kintu) | URL do webhook a configurar |
|---|---|
| 3.000 Kz (`9b161c75…`) | `https://kypohaagiozofdoadvgu.supabase.co/functions/v1/kintu-webhook?secret=12b764d47c3cbbd1996e4029fea5e7294a9b027ec341580e&amount=3000&bonus=0` |
| 5.000 Kz (`618f309f…`) | `https://kypohaagiozofdoadvgu.supabase.co/functions/v1/kintu-webhook?secret=12b764d47c3cbbd1996e4029fea5e7294a9b027ec341580e&amount=5000&bonus=2500` |
| 10.000 Kz (`087022cb…`) | `https://kypohaagiozofdoadvgu.supabase.co/functions/v1/kintu-webhook?secret=12b764d47c3cbbd1996e4029fea5e7294a9b027ec341580e&amount=10000&bonus=7500` |
| 15.000 Kz (`5ef7883f…`) | `https://kypohaagiozofdoadvgu.supabase.co/functions/v1/kintu-webhook?secret=12b764d47c3cbbd1996e4029fea5e7294a9b027ec341580e&amount=15000&bonus=15000` |

## Como o lead é identificado

Por ordem de tentativa:
1. **`ref`** no payload — o site acrescenta `?ref=<user_id>` ao link de checkout;
   se a Kintu devolver esse campo, a identificação é exacta.
2. **Telefone** — o número usado no pagamento é comparado com o telefone do
   registo (últimos 9 dígitos). Só credita se houver exactamente 1 conta.

> Importante: o lead deve pagar com o mesmo número de telefone que usou no registo,
> ou a Kintu deve reenviar o parâmetro `ref` no webhook.

## Segurança e idempotência

- O webhook só aceita chamadas com o `secret` correcto na URL.
- Cada pagamento é creditado **uma única vez** (controlado por `external_id` —
  o ID da transação da Kintu, ou hash do payload).
- Estados `failed/cancelled/refunded/pending` são ignorados.

## Teste manual

```bash
curl -X POST "https://kypohaagiozofdoadvgu.supabase.co/functions/v1/kintu-webhook?secret=12b764d47c3cbbd1996e4029fea5e7294a9b027ec341580e&amount=3000&bonus=0" \
  -H "Content-Type: application/json" \
  -d '{"transaction_id":"teste-001","phone":"923456789","status":"paid"}'
```

Resposta esperada: `{"ok":true, "user_id":"…", "amount":3000, "bonus":0, …}`
e o saldo do perfil com esse telefone sobe 3.000 Kz. Repetir o mesmo
`transaction_id` devolve `duplicate` e não credita de novo.

> ✅ Testado a 2026-07-20: crédito de 5.000+1.000 e bloqueio de duplicado a funcionar.

## Ficheiros

- Schema da base de dados: `supabase/migrations/20260720_muxima_schema.sql`
- Função do webhook: `supabase/functions/kintu-webhook/index.ts`
  (deploy com `verify_jwt` desativado — a autenticação é feita pelo `secret`)

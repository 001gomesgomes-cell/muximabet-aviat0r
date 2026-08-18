# Muxima Bet — Webhook de confirmação de depósitos (Kintu)

## O que é

Quando um lead paga um dos produtos na Kintu, a plataforma chama este webhook e o
saldo (valor + bónus) é creditado automaticamente no perfil do lead no Supabase.

## URL do webhook (colocar nos produtos da Kintu)

Projecto Supabase: **kypohaagiozofdoadvgu** (kibisno.ao@gmail.com)

```
https://kypohaagiozofdoadvgu.supabase.co/functions/v1/kintu-webhook?secret=12b764d47c3cbbd1996e4029fea5e7294a9b027ec341580e
```

### Bónus por pacote (forçado no servidor)

> **Nota (2026-07-24):** o bónus é agora definido pela função `public.credit_deposit`
> no Supabase, com base no **valor** do depósito (3000→0, 5000→2500, 10000→7500,
> 15000→15000). O `&bonus=` da Kintu é **ignorado** para estes pacotes, por isso não
> é obrigatório reconfigurar a Kintu — basta o `&amount=` estar correcto. As URLs
> abaixo já refletem os valores certos na mesma.

### Recomendado — uma URL por produto (força o pacote e o bónus)

Cola a URL correspondente no campo de webhook/notificação de cada produto na Kintu.
Assim o crédito é sempre exacto mesmo que a Kintu não envie o ID do produto:

| Produto (Kintu) | URL do webhook a configurar |
|---|---|
| 3.000 Kz | Checkout: `https://pay.kursinha.com/c/6a82ed5eba0c9596c1f15286` |
| 5.000 Kz | Checkout: `https://pay.kursinha.com/c/6a82ee6aea152779f7098ac5` |
| 10.000 Kz | Checkout: `https://pay.kursinha.com/c/6a82eeffba0c9596c1f1528a` |
| 15.000 Kz | Checkout: `https://pay.kursinha.com/c/6a82ef411a12f2ffecb87598` |
| Taxa de ativação | Checkout: `https://pay.kursinha.com/c/6a82f04cba0c9596c1f1528f` |

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

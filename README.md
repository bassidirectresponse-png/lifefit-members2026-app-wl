# Life Fit Members

Plataforma premium de conteúdo exclusivo para mulheres 35+ que querem emagrecer de forma natural. Clube de rituais semanais com drip content personalizado.

## Stack

- Next.js 14 (App Router, TypeScript strict)
- Tailwind CSS (paleta e tipografia customizadas)
- Supabase (Auth, Postgres, Storage)
- Framer Motion (animações)
- React Hook Form + Zod (formulários)
- Lenis (smooth scroll)
- Fraunces + Inter (tipografia)

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Anote a **Project URL** e a **anon key** (em Settings > API)

### 3. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha:

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### 4. Executar o schema do banco

No Supabase Dashboard, vá em **SQL Editor** e execute os arquivos na ordem:

1. `supabase/schema.sql` — cria tabelas, RLS, triggers e storage
2. `supabase/seed.sql` — insere 4 semanas de exemplo com 5 aulas cada

### 5. Criar usuário admin

No Supabase Dashboard:

1. Vá em **Authentication > Users** e clique em **Add user**
2. Crie com email e senha
3. Vá em **Table Editor > profiles**, encontre o registro criado automaticamente
4. Mude o campo `role` para `admin`
5. Preencha o campo `nome`

### 6. Rodar o projeto

```bash
npm run dev
```

Acesse `http://localhost:3000/login`

## Estrutura

```
app/
  (auth)/login/          # Página de login
  (member)/              # Área logada
    page.tsx             # Dashboard
    semana/[numero]/     # Página da semana
    aula/[id]/           # Player de conteúdo
    conta/               # Perfil da usuária
  admin/                 # Painel administrativo
components/
  ui/                    # Componentes base customizados
  member/                # Componentes da área de membro
  admin/                 # Componentes do admin
lib/
  supabase/              # Clients Supabase (browser + server)
  utils/                 # Utilidades (cn, drip content)
  hooks/                 # Custom hooks
types/                   # Types TypeScript
supabase/                # Schema SQL e seed
```

## Drip Content

O desbloqueio de semanas é calculado individualmente por usuária com base no campo `data_inicio_jornada`:

```ts
const semanasLiberadas = Math.floor(
  (Date.now() - new Date(profile.data_inicio_jornada).getTime())
  / (7 * 24 * 60 * 60 * 1000)
) + 1;
```

Semanas futuras aparecem como cards bloqueados mostrando "Disponível em X dias".

## Administração

- Acesse `/admin` com um usuário com role `admin`
- Gerencie módulos (semanas), aulas e usuárias
- Ajuste a data de início da jornada de cada usuária
- Ative/desative acessos

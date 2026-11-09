# Pão com Vini — site institucional

Site estático (HTML + CSS + JS puro), sem build. Sobe em qualquer hospedagem: HostGator/cPanel, GitHub Pages, Netlify.
Basta enviar a pasta inteira (`index.html`, `styles.css`, `app.js`, `assets/`).

Rodar local: `py -m http.server 8110` dentro da pasta → http://localhost:8110

## Seções
Hero (aberto agora, calculado no fuso de São Paulo) · faixa · Destaques (6 pratos com preço real) · A casa ·
Cardápio por categoria (leva ao cardápio digital MenuFlix) · Almoço (marmitas) · O espaço (galeria + tipos de evento) ·
**Reserva** (formulário → mensagem pronta no WhatsApp) · Horários e contato · botão flutuante de WhatsApp.

## Reserva
O formulário valida nome, WhatsApp, tipo de evento, data, horário, pessoas (2–300) e formato.
Os horários de chegada seguem o funcionamento do dia (seg–sáb 11h–0h, dom 16h–23h), até 1h30 antes de fechar
e com 3h de antecedência no mesmo dia. Ao enviar, abre `wa.me/5541997166194` com tudo preenchido.
A reserva só vale depois que a equipe confirma pelo WhatsApp (avisado no formulário).

Regras ajustáveis em `app.js` → `CONFIG` (`hours`, `lastArrivalBeforeCloseMin`, `minAdvanceHours`).

## O que TROCAR antes de publicar
- [ ] **Fotos**: todas em `assets/img/` são de banco (Unsplash, licença livre) e provisórias. Trocar pelas fotos reais
      mantendo o mesmo nome de arquivo. Na seção "O espaço" há o aviso "Imagens ilustrativas" — remover quando
      entrarem as fotos reais do salão.
- [ ] **Endereço + link do Maps**: `CONFIG.address` e `CONFIG.mapsUrl` em `app.js` (vazio = bloco escondido).
- [ ] **História da casa** (seção "A casa", marcada com comentário `TROCAR` no `index.html`).
- [ ] **Link do cardápio**: `CONFIG.menu` aponta pra demo do MenuFlix no Railway; trocar pelo domínio definitivo.
- [ ] Preços dos destaques/almoço estão no `index.html` e vieram do cardápio do 99Food (preço cheio, sem promoção).

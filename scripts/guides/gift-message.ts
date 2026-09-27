import type { GuideSeed } from "./types";

/**
 * The evergreen traffic guide. "What to write in a card" is the highest-volume
 * question in this category and the one answer engines get asked constantly,
 * so the structure is deliberately extractable: question-shaped headings, a
 * direct answer in the first sentence under each, and short concrete examples
 * rather than prose a model has to summarise.
 *
 * Only occasions whose collections actually hold products are linked. Sympathy,
 * new baby and wedding are covered in the text because people search them, but
 * their collections are empty, and an empty collection is a noindex page and a
 * dead end for a reader.
 */
export const giftMessage: GuideSeed = {
  slug: "what-to-write-in-a-gift-message",
  category: "ETIQUETTE",
  readMinutes: 7,
  featured: false,
  title: {
    en: "What to write in a gift message",
    fr: "Quoi écrire sur une carte-cadeau",
  },
  excerpt: {
    en: "A gift card is three lines long and most people freeze at the first one. A simple structure that works for any occasion, the four mistakes worth avoiding, and worked examples for the moments people actually send gifts for.",
    fr: "Une carte-cadeau fait trois lignes et la plupart des gens bloquent dès la première. Une structure simple qui fonctionne pour toute occasion, les quatre erreurs à éviter et des exemples concrets.",
  },
  seoTitle: {
    en: "What to Write in a Gift Message: Examples for Every Occasion",
    fr: "Quoi écrire sur une carte-cadeau : exemples pour chaque occasion",
  },
  seoDescription: {
    en: "A three-line structure that works for any gift card, the mistakes to avoid, and short examples for birthdays, sympathy, thank-yous, new babies, promotions and more.",
    fr: "Une structure en trois lignes pour toute carte-cadeau, les erreurs à éviter et de courts exemples pour anniversaires, condoléances, remerciements, naissances et promotions.",
  },
  body: {
    en: `<p>The gift is chosen, the address is entered, and then there is a small empty box asking what you would like the card to say. This is where most people stall, and then write something they are vaguely embarrassed by, because the pressure of the blank box makes everyone sound like a greeting card.</p>

<p>It helps to know that the card is short by design. You are not writing a letter. Three lines, sometimes four, is the whole job.</p>

<h2>The structure that works for anything</h2>

<p>Almost every good gift message does the same three things in the same order:</p>

<ol>
<li><strong>Name the moment.</strong> One short line about why today is today.</li>
<li><strong>Say something only you would say.</strong> One specific detail — a thing they did, a thing you noticed, a thing between you.</li>
<li><strong>Sign off warmly.</strong> Short. Your name.</li>
</ol>

<p>The second line does the work. Lines one and three are scaffolding, and everybody writes them fine. What separates a card someone keeps from a card someone recycles is whether line two could have been written by anyone else about anyone else.</p>

<p>Compare:</p>

<blockquote><p>Happy birthday! Hope you have a wonderful day. Love, Sarah</p></blockquote>

<blockquote><p>Happy birthday. Thirty-one feels like a good year to finally take that trip you keep describing to me. Go. Love, Sarah</p></blockquote>

<p>Same length. Entirely different card.</p>

<h2>Four mistakes worth avoiding</h2>

<h3>Mentioning what it cost, or apologising for it</h3>

<p>"Just a little something" and "sorry it's not more" both do the same damage: they tell the recipient to evaluate the gift rather than enjoy it. If you feel the urge, it is usually a sign you should say something warmer instead, not something smaller. (Prices are never included with a Velvéa gift, so the recipient has no way of knowing unless you tell them.)</p>

<h3>Making it about you</h3>

<p>"I've been so busy but I wanted to send something" is a message about your schedule. The card is one of the few places where the other person should be the entire subject.</p>

<h3>Writing to the occasion instead of the person</h3>

<p>Generic warmth reads as effort that stopped early. One specific detail beats three general sentiments every time.</p>

<h3>Overreaching on tone</h3>

<p>A card that is much warmer than the relationship is uncomfortable to receive. Match where you stand with someone. A friendly client does not need "with love", and a close friend does not need "best regards".</p>

<h2>Examples by occasion</h2>

<h3>Birthday</h3>

<ul>
<li>"Happy birthday. You've had a year, and you handled it better than most people would have. Here's to a gentler one."</li>
<li>"Another year of you being the person everyone calls first. Happy birthday."</li>
<li>"Happy birthday — eat the whole box yourself, I won't tell anyone."</li>
</ul>

<p>See <a href="/occasions/birthday">birthday baskets</a>.</p>

<h3>Thank you</h3>

<p>Name the specific thing. A thank-you that does not say what it is for is a formality.</p>

<ul>
<li>"Thank you for Tuesday. You dropped everything and I noticed."</li>
<li>"You've been unreasonably generous with your time this year. This is a very small correction in the other direction."</li>
</ul>

<p>See <a href="/occasions/thank-you">thank-you baskets</a>.</p>

<h3>Anniversary</h3>

<ul>
<li>"Twelve years. I'd do the whole thing again, including the parts we got wrong."</li>
<li>"Happy anniversary to the two of you. Still the couple everyone quietly uses as the standard."</li>
</ul>

<p>See <a href="/occasions/anniversary">anniversary baskets</a>.</p>

<h3>Sympathy</h3>

<p>This is the card people most want to get right and most fear getting wrong. The rules are simpler than the fear suggests.</p>

<p><strong>Do:</strong> use the person's name if you knew them. Acknowledge the loss plainly. Offer something specific if you mean it.</p>

<p><strong>Do not:</strong> explain the loss, look for a silver lining, or say "let me know if you need anything", which puts the work of asking onto the person least able to do it.</p>

<ul>
<li>"I'm so sorry about your mother. I keep thinking about how she used to greet everyone at the door. Thinking of you all week."</li>
<li>"There's nothing useful to say. I'm here, and I'll check in on Sunday."</li>
</ul>

<p>Short is fine. Short is often better.</p>

<h3>New baby</h3>

<ul>
<li>"Congratulations, all three of you. Sleep when you can and let people feed you."</li>
<li>"Welcome to the world, Nora. Your parents are going to be very good at this."</li>
</ul>

<p>A note on new-parent gifts generally: the ones that land best are for the <em>parents</em>. Everyone sends things for the baby.</p>

<h3>Get well</h3>

<p>Keep it light unless the situation is serious, and do not ask for a status update: a card that requires a reply is a task.</p>

<ul>
<li>"Get well soon. The group chat is unbearable without you."</li>
<li>"No need to write back. Just rest, and eat the chocolate."</li>
</ul>

<p>See <a href="/occasions/get-well">get-well baskets</a>.</p>

<h3>Congratulations, a new job, a promotion</h3>

<ul>
<li>"Congratulations. They have no idea how lucky they got."</li>
<li>"You worked for this for three years. Enjoy the part where it finally happened."</li>
</ul>

<p>See <a href="/occasions/congratulations">congratulations</a> and <a href="/occasions/new-job">new job</a>.</p>

<h3>Retirement</h3>

<ul>
<li>"Forty years. Whatever you do on Monday morning, make sure it's nothing."</li>
<li>"Congratulations on the retirement. The place won't be the same, and everyone knows it."</li>
</ul>

<p>See <a href="/occasions/retirement">retirement baskets</a>.</p>

<h3>Housewarming</h3>

<ul>
<li>"Congratulations on the new place. May the boxes be unpacked by spring."</li>
<li>"Happy housewarming — something for the first morning in the new kitchen."</li>
</ul>

<p>See <a href="/occasions/housewarming">housewarming baskets</a>.</p>

<h3>Just because</h3>

<p>The easiest card to write, because there is no occasion to perform.</p>

<ul>
<li>"No reason. I was thinking about you."</li>
<li>"Saw this and thought of you immediately, which felt like reason enough."</li>
</ul>

<p>See <a href="/occasions/just-because">just because</a> and <a href="/occasions/thinking-of-you">thinking of you</a>.</p>

<h2>Business and client messages</h2>

<p>The failure mode for corporate cards is sounding like marketing. A gift that arrives with a sales message attached stops being a gift.</p>

<p>Three rules. <strong>Sign with a person's name</strong>, not just the company. "From everyone at Northfield" is warmer than "Northfield Inc." <strong>Mention the year or the work</strong>, not the account. <strong>Never include a call to action.</strong> No links, no "looking forward to discussing Q1".</p>

<ul>
<li>"Thank you for a genuinely good year of working together. From everyone at Northfield."</li>
<li>"We know this year asked a lot of your team. Thank you for including us in it."</li>
<li>"Congratulations on the opening. Delighted to have had a small part in it."</li>
</ul>

<p>For volume orders we can print one message across a whole run or a different message for each recipient. See the <a href="/guides/corporate-gifting-ontario-cra-rules-budgets-timing">corporate gifting guide</a>.</p>

<h2>Practical notes</h2>

<ul>
<li><strong>Every Velvéa gift includes a printed message card at no charge.</strong> Add your message on the product page or at checkout.</li>
<li><strong>Prices are never included with a gift.</strong> The recipient sees the gift, not the invoice.</li>
<li><strong>A full-size greeting card is available</strong> for a small flat fee, if the occasion calls for something more than a tucked-in card.</li>
<li><strong>Write it in the language they speak.</strong> Obvious, and still the most common mistake on bilingual orders.</li>
</ul>

<p>If you are still choosing the gift itself, start with <a href="/baskets">all gift baskets</a>.</p>`,

    fr: `<p>Le cadeau est choisi, l'adresse est saisie, puis apparaît une petite case vide qui demande ce que la carte devrait dire. C'est là que la plupart des gens se figent, avant d'écrire quelque chose qui les gêne un peu, parce que la pression de la case vide fait sonner tout le monde comme une carte de souhaits.</p>

<p>Il est utile de savoir que la carte est courte par conception. Vous n'écrivez pas une lettre. Trois lignes, parfois quatre, et c'est tout.</p>

<h2>La structure qui fonctionne pour tout</h2>

<p>Presque tous les bons messages font les mêmes trois choses, dans le même ordre :</p>

<ol>
<li><strong>Nommez le moment.</strong> Une courte ligne sur ce qui fait d'aujourd'hui aujourd'hui.</li>
<li><strong>Dites quelque chose que vous seul diriez.</strong> Un détail précis — une chose qu'elle a faite, une chose que vous avez remarquée, une chose entre vous.</li>
<li><strong>Terminez chaleureusement.</strong> Court. Votre nom.</li>
</ol>

<p>La deuxième ligne <em>est</em> le message. Les lignes une et trois sont l'échafaudage, et tout le monde les réussit. Ce qui distingue une carte qu'on garde d'une carte qu'on recycle, c'est de savoir si la deuxième ligne aurait pu être écrite par n'importe qui à propos de n'importe qui.</p>

<p>Comparez :</p>

<blockquote><p>Bon anniversaire ! J'espère que tu passeras une merveilleuse journée. Je t'embrasse, Sarah</p></blockquote>

<blockquote><p>Bon anniversaire. Trente et un ans, ça me semble la bonne année pour enfin faire ce voyage dont tu me parles sans arrêt. Vas-y. Je t'embrasse, Sarah</p></blockquote>

<p>Même longueur. Carte entièrement différente.</p>

<h2>Quatre erreurs à éviter</h2>

<h3>Mentionner le prix, ou s'en excuser</h3>

<p>« Un petit quelque chose » et « désolée, ce n'est pas grand-chose » font le même tort : ils invitent le destinataire à évaluer le cadeau plutôt qu'à en profiter. Si l'envie vous prend, c'est généralement le signe qu'il faut dire quelque chose de plus chaleureux, pas de plus modeste. (Les prix ne sont jamais joints à un cadeau Velvéa : le destinataire ne peut pas le savoir, sauf si vous le lui dites.)</p>

<h3>Parler de soi</h3>

<p>« J'ai été tellement occupée mais je voulais t'envoyer quelque chose » est un message sur votre horaire. La carte est l'un des rares endroits où l'autre personne devrait être le sujet entier.</p>

<h3>Écrire à l'occasion plutôt qu'à la personne</h3>

<p>La chaleur générique se lit comme un effort interrompu trop tôt. Un détail précis vaut mieux que trois formules générales, chaque fois.</p>

<h3>Forcer le ton</h3>

<p>Une carte nettement plus chaleureuse que la relation est inconfortable à recevoir. Tenez-vous-en à où vous en êtes avec la personne. Un client sympathique n'a pas besoin d'un « je t'embrasse », et une amie proche n'a pas besoin de « cordialement ».</p>

<h2>Exemples par occasion</h2>

<h3>Anniversaire</h3>

<ul>
<li>« Bon anniversaire. Tu as eu toute une année, et tu l'as traversée mieux que la plupart des gens l'auraient fait. À une année plus douce. »</li>
<li>« Une année de plus à être la personne que tout le monde appelle en premier. Bon anniversaire. »</li>
<li>« Bon anniversaire — mange toute la boîte toute seule, je ne dirai rien. »</li>
</ul>

<p>Voir les <a href="/fr/occasions/birthday">paniers d'anniversaire</a>.</p>

<h3>Merci</h3>

<p>Nommez la chose précise. Un remerciement qui ne dit pas pourquoi est une formalité.</p>

<ul>
<li>« Merci pour mardi. Tu as tout laissé tomber et je l'ai remarqué. »</li>
<li>« Tu as été d'une générosité déraisonnable avec ton temps cette année. Voici une toute petite correction dans l'autre sens. »</li>
</ul>

<p>Voir les <a href="/fr/occasions/thank-you">paniers de remerciement</a>.</p>

<h3>Anniversaire de mariage</h3>

<ul>
<li>« Douze ans. Je recommencerais tout, y compris les bouts qu'on a ratés. »</li>
<li>« Bon anniversaire à vous deux. Toujours le couple que tout le monde prend discrètement comme référence. »</li>
</ul>

<p>Voir les <a href="/fr/occasions/anniversary">paniers d'anniversaire de mariage</a>.</p>

<h3>Condoléances</h3>

<p>C'est la carte que l'on veut le plus réussir et que l'on craint le plus de rater. Les règles sont plus simples que la crainte ne le laisse croire.</p>

<p><strong>À faire :</strong> nommez la personne si vous la connaissiez. Reconnaissez la perte simplement. Offrez quelque chose de précis si vous le pensez vraiment.</p>

<p><strong>À éviter :</strong> expliquer la perte, chercher une consolation, ou dire « fais-moi signe si tu as besoin de quoi que ce soit », ce qui confie le travail de demander à la personne la moins en mesure de le faire.</p>

<ul>
<li>« Je suis vraiment désolée pour ta mère. Je repense sans cesse à sa façon d'accueillir tout le monde à la porte. Je pense à vous toute la semaine. »</li>
<li>« Il n'y a rien d'utile à dire. Je suis là, et je prendrai de tes nouvelles dimanche. »</li>
</ul>

<p>Court, c'est bien. Court, c'est souvent mieux.</p>

<h3>Naissance</h3>

<ul>
<li>« Félicitations à vous trois. Dormez quand vous pouvez et laissez les gens vous nourrir. »</li>
<li>« Bienvenue au monde, Nora. Tes parents vont être très bons là-dedans. »</li>
</ul>

<p>Une remarque sur les cadeaux de naissance en général : ceux qui touchent le plus sont pour les <em>parents</em>. Tout le monde envoie des choses pour le bébé.</p>

<h3>Prompt rétablissement</h3>

<p>Restez léger si la situation ne l'est pas, et ne demandez pas de nouvelles : une carte qui exige une réponse est une tâche.</p>

<ul>
<li>« Rétablis-toi vite. Le groupe de discussion est insupportable sans toi. »</li>
<li>« Pas besoin de répondre. Repose-toi, et mange le chocolat. »</li>
</ul>

<p>Voir les <a href="/fr/occasions/get-well">paniers de rétablissement</a>.</p>

<h3>Félicitations, nouvel emploi, promotion</h3>

<ul>
<li>« Félicitations. Ils n'ont aucune idée de la chance qu'ils ont. »</li>
<li>« Tu as travaillé trois ans pour ça. Savoure le moment où c'est enfin arrivé. »</li>
</ul>

<p>Voir <a href="/fr/occasions/congratulations">félicitations</a> et <a href="/fr/occasions/new-job">nouvel emploi</a>.</p>

<h3>Retraite</h3>

<ul>
<li>« Quarante ans. Quoi que tu fasses lundi matin, assure-toi que ce soit rien du tout. »</li>
<li>« Félicitations pour la retraite. L'endroit ne sera plus le même, et tout le monde le sait. »</li>
</ul>

<p>Voir les <a href="/fr/occasions/retirement">paniers de retraite</a>.</p>

<h3>Pendaison de crémaillère</h3>

<ul>
<li>« Félicitations pour le nouveau chez-vous. Que les boîtes soient vidées d'ici le printemps. »</li>
<li>« Bonne crémaillère — de quoi réussir le premier matin dans la nouvelle cuisine. »</li>
</ul>

<p>Voir les <a href="/fr/occasions/housewarming">paniers de crémaillère</a>.</p>

<h3>Juste comme ça</h3>

<p>La carte la plus facile à écrire, parce qu'il n'y a aucune occasion à honorer.</p>

<ul>
<li>« Aucune raison. Je pensais à toi. »</li>
<li>« J'ai vu ça et j'ai pensé à toi immédiatement, ce qui m'a semblé une raison suffisante. »</li>
</ul>

<p>Voir <a href="/fr/occasions/just-because">juste comme ça</a> et <a href="/fr/occasions/thinking-of-you">je pense à toi</a>.</p>

<h2>Messages d'affaires et aux clients</h2>

<p>Le piège des cartes d'entreprise est de sonner comme du marketing. Un cadeau accompagné d'un message de vente cesse d'être un cadeau.</p>

<p>Trois règles. <strong>Signez d'un nom de personne</strong>, pas seulement de l'entreprise. « De toute l'équipe de Northfield » est plus chaleureux que « Northfield inc. ». <strong>Mentionnez l'année ou le travail</strong>, pas le compte. <strong>N'incluez jamais d'appel à l'action.</strong> Aucun lien, aucun « au plaisir d'en discuter au premier trimestre ».</p>

<ul>
<li>« Merci pour une année de collaboration véritablement agréable. De toute l'équipe de Northfield. »</li>
<li>« Nous savons que cette année a beaucoup demandé à votre équipe. Merci de nous y avoir inclus. »</li>
<li>« Félicitations pour l'ouverture. Ravis d'y avoir joué un petit rôle. »</li>
</ul>

<p>Pour les commandes en volume, nous pouvons imprimer un seul message sur toute une série ou un message différent pour chaque destinataire. Voir le <a href="/fr/guides/corporate-gifting-ontario-cra-rules-budgets-timing">guide des cadeaux d'affaires</a>.</p>

<h2>Notes pratiques</h2>

<ul>
<li><strong>Chaque cadeau Velvéa comprend une carte-message imprimée sans frais.</strong> Ajoutez votre message sur la fiche produit ou à la caisse.</li>
<li><strong>Les prix ne sont jamais joints au cadeau.</strong> Le destinataire voit le cadeau, pas la facture.</li>
<li><strong>Une carte de souhaits pleine grandeur est offerte</strong> moyennant un petit montant fixe, si l'occasion appelle plus qu'une carte glissée à l'intérieur.</li>
<li><strong>Écrivez dans la langue de la personne.</strong> Évident, et pourtant l'erreur la plus fréquente sur les commandes bilingues.</li>
</ul>

<p>Si le cadeau lui-même reste à choisir, commencez par <a href="/fr/baskets">tous les paniers-cadeaux</a>.</p>`,
  },
};

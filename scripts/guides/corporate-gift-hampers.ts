import type { GuideSeed } from "./types";

/**
 * The companion to the flagship corporate guide, aimed at the "what should
 * actually be in it" search rather than the "what does the CRA say" one.
 *
 * Deliberately does not repeat the tax, budget or timing material: those live
 * in corporate-gifting-ontario-cra-rules-budgets-timing, and two pages
 * answering the same question would compete with each other in search. This
 * one links there instead and stays on choosing the hamper: where it lands,
 * who it is for, dietary inclusivity, presentation and branding, and the brief
 * to send us.
 *
 * Service claims (volume pricing from 10, branded cards, multi-address delivery
 * across Ontario, one-business-day quote reply) match the corporate page copy
 * in messages/*.json. If that copy changes, check this guide.
 */
export const corporateGiftHampers: GuideSeed = {
  slug: "corporate-gift-hampers-how-to-choose",
  category: "CORPORATE",
  readMinutes: 7,
  featured: false,
  title: {
    en: "Corporate gift hampers: how to choose one people remember",
    fr: "Paniers-cadeaux d'entreprise : comment en choisir un dont on se souvient",
  },
  excerpt: {
    en: "The right corporate hamper depends less on the budget than on where it lands, who opens it and what they cannot eat. How to choose hampers for clients, teams and partners, and what to put in the brief so the proposal comes back right first time.",
    fr: "Le bon panier d'entreprise dépend moins du budget que de l'endroit où il arrive, de qui l'ouvre et de ce que cette personne ne peut pas manger. Comment choisir des paniers pour clients, équipes et partenaires, et quoi nous dire pour recevoir une proposition juste du premier coup.",
  },
  seoTitle: {
    en: "Corporate Gift Hampers in the GTA: How to Choose the Right One",
    fr: "Paniers-cadeaux d'entreprise dans le Grand Toronto : bien choisir",
  },
  seoDescription: {
    en: "How to choose corporate gift hampers for clients and employees in Mississauga, Toronto and the GTA: office versus home delivery, dietary inclusivity, alcohol-free options, branding that works, and how to brief a supplier.",
    fr: "Comment choisir des paniers-cadeaux d'entreprise pour clients et employés dans le Grand Toronto : livraison au bureau ou à domicile, inclusion alimentaire, options sans alcool, image de marque et demande au fournisseur.",
  },
  body: {
    en: `<p>Most corporate hampers are chosen from a price list. Pick a number, find the basket at that number, send it to everyone. The result is usually fine and rarely remembered. The hampers that get photographed, passed around and mentioned in thank-you emails are chosen the other way round, starting with the person who opens them.</p>

<p>This guide is about that choice. For the tax treatment, budgets and ordering deadlines, see our <a href="/guides/corporate-gifting-ontario-cra-rules-budgets-timing">corporate gifting guide</a>. Here we assume you know roughly what you are spending and want to spend it well.</p>

<h2>Decide where it lands before deciding what goes in it</h2>

<p>The same hamper behaves very differently at an office and at a home.</p>

<table>
<thead>
<tr><th></th><th>Sent to an office</th><th>Sent to a home</th></tr>
</thead>
<tbody>
<tr><td>Who opens it</td><td>Often reception, then a team</td><td>The recipient, often with family</td></tr>
<tr><td>What works</td><td>Shareable: chocolate, snacks, biscuits that can go on a table</td><td>Personal: coffee and tea, self-care, something for an evening in</td></tr>
<tr><td>What goes wrong</td><td>A personal gift gets picked apart by eleven people</td><td>A pile of snacks meant for a team, for one person</td></tr>
<tr><td>Timing</td><td>Must arrive on a working day, before people leave for the holidays</td><td>More forgiving; nobody is waiting at a desk</td></tr>
</tbody>
</table>

<p>As a rule of thumb, one hamper to a team is a shareable gift and one hamper per person is a personal gift. Mixing the two up is the most common reason a generous budget falls flat.</p>

<h2>Match the hamper to the relationship</h2>

<h3>Clients</h3>

<p>A client gift says "we value working with you". It should feel finished, not like a sampler. Fewer, better things beat a crowded basket, and presentation counts for more than people expect: a hamper that arrives looking good is half the gift. Our <a href="/recipients/clients">baskets for clients</a> are chosen with that in mind.</p>

<h3>Employees</h3>

<p>An employee gift is a thank-you, and now that so many teams are hybrid it lands at home more often than not. Personal beats promotional. Something they would enjoy on a Sunday morning does more than another branded item. See <a href="/recipients/employees">baskets for employees</a>.</p>

<h3>Partners, suppliers and referral sources</h3>

<p>These relationships often go unthanked, which is exactly why a hamper stands out. A shareable basket for the whole office works well here, since the relationship usually involves several people.</p>

<h2>Make it inclusive by default</h2>

<p>Send to fifty people and you are sending to people with allergies, dietary rules, religious practices and preferences you know nothing about. A hamper that works for all of them is a better hamper, not a compromise.</p>

<p>Alcohol is the easy part. Velvéa sells none, so you never have to work out who does not drink. Nothing needs to be signed for by an adult, and nothing can land badly with someone in recovery, someone who abstains for religious reasons, or an organisation that does not accept alcohol as a gift.</p>

<p>Food takes more care. Gelatine, nuts and eggs are the usual surprises, and since every basket is packed by hand after the order, the simplest way to know is to <a href="/contact">ask us</a> what a basket contains. We will tell you exactly. For anyone with a serious allergy, a <a href="/category/spa-wellness">spa and wellness</a> hamper sidesteps the question entirely, and on a large list it is worth keeping one or two in reserve.</p>

<p>Then there is the calendar. A "Merry Christmas" hamper to a whole client list is a narrower gift than it looks. A year-end thank-you or a holiday-season message travels further, and for clients and teams who celebrate it, a <a href="/guides/diwali-gift-hampers-gta">Diwali hamper</a> arrives five weeks before everyone else's.</p>

<h2>Branding: less is more</h2>

<p>The instinct is to put a logo on everything. Resist it. A hamper is valued as a gift, and the more it looks like marketing, the less it feels like one.</p>

<p>Your company belongs on the card, not on the contents, and we print branded cards and custom messages for exactly that purpose. Sign it as people, too: "From everyone at Northfield" is warmer than "Northfield Inc.", and a note from the account manager is warmer still. We can print a different message for each recipient on the same run. For your top twenty clients, it is worth writing twenty lines.</p>

<p>For help with the wording, see <a href="/guides/what-to-write-in-a-gift-message">what to write in a gift message</a>.</p>

<h2>The details that decide how it arrives</h2>

<ul>
<li>Fresh flowers and chocolate-heavy hampers are local delivery only. If your list goes beyond the GTA, choose shelf-stable hampers that ship across Ontario; every product page says which is which.</li>
<li>Collect addresses early. On a multi-address order, the last few addresses are what holds everything up, so gather them before you finalise the selection.</li>
<li>People compare. Choose one hamper for each group (all clients, all of one team) and keep it the same within the group.</li>
<li>Prices are never included with a Velvéa gift.</li>
</ul>

<h2>The brief that gets you a good proposal</h2>

<p>When you <a href="/corporate/quote">request a corporate quote</a>, these six things let us come back with a proposal you can approve rather than a list of questions. We reply within one business day.</p>

<ol>
<li><strong>How many</strong>, and whether to one address or many.</li>
<li><strong>Budget per hamper</strong>, or per group if you have tiers.</li>
<li><strong>Who it is for</strong>: clients, a team, partners, or a mix.</li>
<li><strong>The occasion</strong>: year-end, Diwali, a milestone, a closed deal, onboarding.</li>
<li><strong>Delivery dates</strong>, and whether office or home.</li>
<li><strong>Anything to avoid</strong>: known allergies, dietary rules, a client who does not do chocolate.</li>
</ol>

<p>Volume pricing starts at 10 hampers, multi-address orders come on one invoice, and you deal with one person from brief to delivery. If you would rather browse first, start with <a href="/corporate">our corporate page</a>, <a href="/recipients/clients">baskets for clients</a> or <a href="/recipients/employees">baskets for employees</a>.</p>`,

    fr: `<p>La plupart des paniers d'entreprise sont choisis à partir d'une liste de prix. On fixe un montant, on prend le panier à ce montant, on l'envoie à tout le monde. Le résultat est généralement correct et rarement mémorable. Les paniers qu'on photographie, qu'on fait circuler et qu'on mentionne dans les courriels de remerciement sont choisis dans l'autre sens, en partant de la personne qui les ouvre.</p>

<p>Ce guide porte sur ce choix. Pour le traitement fiscal, les budgets et les délais de commande, consultez notre <a href="/fr/guides/corporate-gifting-ontario-cra-rules-budgets-timing">guide des cadeaux d'affaires</a>. Ici, nous supposons que vous savez à peu près ce que vous dépensez et que vous voulez bien le dépenser.</p>

<h2>Décidez où il arrive avant de décider ce qu'il contient</h2>

<p>Le même panier se comporte tout autrement au bureau et à la maison.</p>

<table>
<thead>
<tr><th></th><th>Envoyé au bureau</th><th>Envoyé à domicile</th></tr>
</thead>
<tbody>
<tr><td>Qui l'ouvre</td><td>Souvent la réception, puis une équipe</td><td>Le destinataire, souvent avec sa famille</td></tr>
<tr><td>Ce qui fonctionne</td><td>À partager : chocolat, collations, biscuits qu'on pose sur une table</td><td>Personnel : café et thé, soins, de quoi passer une soirée à la maison</td></tr>
<tr><td>Ce qui dérape</td><td>Un cadeau personnel se fait éplucher par onze personnes</td><td>Une montagne de collations prévue pour une équipe, pour une seule personne</td></tr>
<tr><td>Délais</td><td>Doit arriver un jour ouvrable, avant les départs en congé</td><td>Plus souple ; personne n'attend à un bureau</td></tr>
</tbody>
</table>

<p>En règle générale, un panier pour une équipe est un cadeau à partager et un panier par personne est un cadeau personnel. Confondre les deux est la raison la plus fréquente pour laquelle un budget généreux tombe à plat.</p>

<h2>Adaptez le panier à la relation</h2>

<h3>Clients</h3>

<p>Un cadeau client dit « nous apprécions travailler avec vous ». Il doit paraître soigné et complet, pas comme un assortiment d'échantillons. Moins de choses, mais meilleures, valent mieux qu'un panier encombré, et la présentation compte plus qu'on ne le pense : un panier qui arrive impeccable, c'est la moitié du cadeau. Nos <a href="/fr/recipients/clients">paniers pour clients</a> sont choisis dans cet esprit.</p>

<h3>Employés</h3>

<p>Un cadeau aux employés est un remerciement, et maintenant que tant d'équipes sont hybrides, il arrive le plus souvent à domicile. Le personnel l'emporte sur le promotionnel. Une chose qu'on savoure un dimanche matin fait plus qu'un énième article à logo. Voir les <a href="/fr/recipients/employees">paniers pour employés</a>.</p>

<h3>Partenaires, fournisseurs et sources de recommandations</h3>

<p>Ces relations sont souvent oubliées, et c'est justement pourquoi un panier se remarque. Un panier à partager pour tout le bureau fonctionne bien ici, puisque la relation implique généralement plusieurs personnes.</p>

<h2>Rendez-le inclusif par défaut</h2>

<p>Envoyez à cinquante personnes et vous envoyez à des gens qui ont des allergies, des règles alimentaires, des pratiques religieuses et des préférences dont vous ne savez rien. Un panier qui leur convient à tous est un meilleur panier, pas un compromis.</p>

<p>L'alcool, c'est la partie facile. Velvéa n'en vend pas : vous n'avez jamais à deviner qui ne boit pas. Aucune signature d'adulte n'est requise, et rien ne peut mal tomber chez une personne en rétablissement, une personne qui s'abstient pour des raisons religieuses ou une organisation qui refuse l'alcool en cadeau.</p>

<p>Les aliments demandent plus d'attention. La gélatine, les noix et les œufs sont les surprises habituelles, et comme chaque panier est assemblé à la main après la commande, le plus simple est de <a href="/fr/contact">nous demander</a> ce que contient un panier. Nous vous le dirons exactement. Pour toute personne ayant une allergie grave, un panier <a href="/fr/category/spa-wellness">spa et bien-être</a> évite entièrement la question, et sur une longue liste, il vaut la peine d'en garder un ou deux en réserve.</p>

<p>Reste le calendrier. Un panier « Joyeux Noël » envoyé à toute une liste de clients est un cadeau plus étroit qu'il n'y paraît. Un remerciement de fin d'année ou un message pour le temps des Fêtes voyage plus loin, et pour les clients et équipes qui le célèbrent, un <a href="/fr/guides/diwali-gift-hampers-gta">panier de Diwali</a> arrive cinq semaines avant tous les autres.</p>

<h2>Image de marque : moins, c'est mieux</h2>

<p>Le réflexe est de mettre un logo partout. Résistez-y. Un panier est apprécié comme un cadeau, et plus il ressemble à de la publicité, moins il en a l'air.</p>

<p>Votre entreprise a sa place sur la carte, pas sur le contenu, et c'est précisément pour cela que nous imprimons des cartes personnalisées et des messages sur mesure. Signez aussi en tant que personnes : « De toute l'équipe de Northfield » est plus chaleureux que « Northfield inc. », et un mot du gestionnaire de compte l'est encore davantage. Nous pouvons imprimer un message différent pour chaque destinataire d'une même série. Pour vos vingt meilleurs clients, écrire vingt lignes en vaut la peine.</p>

<p>Pour vous aider à formuler, consultez <a href="/fr/guides/what-to-write-in-a-gift-message">quoi écrire dans un message de cadeau</a>.</p>

<h2>Les détails qui décident de l'arrivée</h2>

<ul>
<li>Les fleurs fraîches et les paniers riches en chocolat sont livrés localement seulement. Si votre liste dépasse le Grand Toronto, choisissez des paniers de longue conservation expédiables partout en Ontario ; chaque fiche produit indique lesquels.</li>
<li>Recueillez les adresses tôt. Dans une commande multi-adresses, ce sont les dernières adresses qui retardent tout : réunissez-les avant d'arrêter la sélection.</li>
<li>Les gens comparent. Choisissez un panier par groupe (tous les clients, toute une équipe) et gardez-le identique à l'intérieur du groupe.</li>
<li>Les prix ne sont jamais joints à un cadeau Velvéa.</li>
</ul>

<h2>Ce qu'il faut nous dire pour obtenir une bonne proposition</h2>

<p>Lorsque vous <a href="/fr/corporate/quote">demandez une soumission d'entreprise</a>, ces six éléments nous permettent de revenir avec une proposition à approuver plutôt qu'une liste de questions. Nous répondons en un jour ouvrable.</p>

<ol>
<li><strong>Combien</strong>, et à une seule adresse ou à plusieurs.</li>
<li><strong>Le budget par panier</strong>, ou par groupe si vous avez des paliers.</li>
<li><strong>À qui il s'adresse</strong> : clients, une équipe, des partenaires, ou un mélange.</li>
<li><strong>L'occasion</strong> : fin d'année, Diwali, un jalon, une entente conclue, une intégration.</li>
<li><strong>Les dates de livraison</strong>, et bureau ou domicile.</li>
<li><strong>Ce qu'il faut éviter</strong> : allergies connues, règles alimentaires, un client qui ne mange pas de chocolat.</li>
</ol>

<p>Les prix de volume commencent à 10 paniers, les commandes multi-adresses sont réunies sur une seule facture, et vous traitez avec une seule personne de la première demande à la livraison. Si vous préférez d'abord parcourir, commencez par <a href="/fr/corporate">notre page entreprises</a>, les <a href="/fr/recipients/clients">paniers pour clients</a> ou les <a href="/fr/recipients/employees">paniers pour employés</a>.</p>`,
  },
};

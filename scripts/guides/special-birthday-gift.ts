import type { GuideSeed } from "./types";

/**
 * Third birthday guide, and the only one about the "how" instead of the
 * "what". `birthday-gift-basket-ideas` picks a basket by recipient, the
 * milestone guide goes by age, and the "doesn't want anything" article handles
 * the refuser. None of them answers "how do I make a birthday gift special /
 * personal", which is what people type when they already have an idea and want
 * it to land. This one does, and it hands off to the custom request form for
 * anyone who would rather we built it.
 *
 * Kept true to the rest of the site:
 * - No time of day is promised for delivery. The advice is to choose the date
 *   and, if the gift has to be in their hands before a dinner, to have it
 *   arrive the day before or collect it.
 * - The only lead time stated is the two days fresh flowers need.
 * - The custom styles are described as looks, never as fixed contents
 *   (see custom-gift-hamper.ts and src/lib/gift-styles.ts).
 * - No product names and no prices.
 */
export const specialBirthdayGift: GuideSeed = {
  slug: "how-to-make-a-birthday-gift-special",
  category: "OCCASIONS",
  readMinutes: 6,
  featured: false,
  title: {
    en: "How to make a birthday gift feel special, even if you only thought of it this week",
    fr: "Comment rendre un cadeau d'anniversaire spécial, même si vous y avez pensé cette semaine",
  },
  excerpt: {
    en: "A special birthday gift is rarely the expensive one. It is the one that could only have been meant for that person. Six ways to get there: one detail nobody else knows, a single main gift, a printed photo, the wrapping, the timing and a card worth keeping.",
    fr: "Un cadeau d'anniversaire spécial est rarement le plus cher. C'est celui qui ne pouvait être destiné qu'à cette personne. Six façons d'y arriver : un détail que personne d'autre ne connaît, un seul cadeau principal, une photo imprimée, l'emballage, le moment et une carte qu'on garde.",
  },
  seoTitle: {
    en: "How to Make a Birthday Gift Special: 6 Personal Touches",
    fr: "Comment rendre un cadeau d'anniversaire spécial",
  },
  seoDescription: {
    en: "How to make a birthday gift special and personal: build it around one detail, add a photo, get the wrapping and timing right, and write a card they keep. Custom birthday gifts made in Mississauga, delivered across the GTA.",
    fr: "Comment rendre un cadeau d'anniversaire spécial et personnel : un détail bien choisi, une photo, l'emballage, le bon moment et une carte qu'on garde. Cadeaux d'anniversaire sur mesure faits à Mississauga, livrés dans le Grand Toronto.",
  },
  body: {
    en: `<p>Think of the best birthday present you were ever given. It was probably not the most expensive one. More likely it was the one that made you say "how did you know?", because somebody had noticed a small thing about you and remembered it for months.</p>

<p>That is all "special" means in a gift. It could not have been handed to anyone else. The good news is that this costs attention, not money, and most of it can be done in a week. Here are the six things that make the difference, roughly in the order you should think about them.</p>

<h2>1. Start with one detail only you would know</h2>

<p>Every person has a short list of things they are particular about. The tea they order by name. The chocolate bar from their childhood that is hard to find here. The hand cream they have bought since university. The snack they hide from the children.</p>

<p>One item from that list does more than ten nice things chosen from a shelf, because it proves you were paying attention. If you cannot think of one, you have three easy sources: their kitchen cupboard, their bathroom shelf, and the person they live with. A text that says "what does she always run out of?" usually gets an answer in a minute.</p>

<p>Write the detail down as exactly as you can, with the brand, the flavour or the shade. "Earl Grey" is a guess. "The loose-leaf Earl Grey in the yellow tin" is a gift.</p>

<h2>2. Give it a centre</h2>

<p>A gift made of many small equal things looks like shopping. A gift with one main item and a few smaller ones around it looks planned. So decide what the centre is: the fragrance, the book, the good headphones, the framed photo. Then let everything else keep it company. Chocolate beside a novel. A candle and bath salts beside a robe. Coffee and a mug beside a new journal.</p>

<p>This also keeps the budget honest. Spend most of it on the main item and choose the good version, then fill in with two or three inexpensive things they will use up. If the main gift is already bought and you only need it presented, that is a job we do often. Our guide to <a href="/guides/custom-gift-hamper-how-to-order">ordering a custom gift hamper</a> explains how.</p>

<h2>3. Put a photograph in it</h2>

<p>We carry thousands of photos on our phones and print almost none of them, which is why a printed photograph still stops people. One good picture in a simple frame turns a box of nice things into something they keep on a shelf after the chocolate is gone.</p>

<p>Choose a photo of a moment, not a pose. The blurry one from the cottage beats the group shot where everyone is looking at the camera. Use the original file from your phone, not a screenshot or a copy saved from a chat, because those print soft. And one or two photos are enough. A birthday gift is not an album.</p>

<h2>4. Make the opening part of the gift</h2>

<p>How a gift is opened is the first thing the person experiences, and it is the cheapest part to get right. If you are putting it together at home, a few habits help:</p>

<ul>
<li>Pick one colour for the tissue, ribbon and card, and stay with it.</li>
<li>Take every price sticker off, including the one under the box.</li>
<li>Put the tallest item at the back and the main gift where the eye lands first.</li>
<li>Fill the gaps with tissue or paper shred so nothing slides around when the box is carried.</li>
<li>Wrap the main item separately inside the box, so there is one more thing to open.</li>
</ul>

<p>A plain box packed with care looks better than an expensive basket with items rattling in it.</p>

<h2>5. Get the timing right</h2>

<p>A birthday gift that turns up on the day says you remembered. The same gift three days later says you remembered eventually. If you will not see the person on their birthday, have the gift delivered so that it is there when the day starts, not after it has ended.</p>

<p>Two practical points. If there is a dinner or a party and you want the gift opened before it, have it arrive the day before. And if they will be away for the birthday itself, send it to wherever they will be, or wait until they are home and tell them on the day that something is coming. In Mississauga and the rest of the GTA, an order placed before noon can still be delivered the same day. Our <a href="/guides/same-day-gift-delivery-mississauga-toronto-gta">same-day delivery guide</a> has the cutoffs and costs for each city.</p>

<h2>6. Write the card last, and write it properly</h2>

<p>The card is the only part of a gift that is entirely from you, and it is usually written in the last ten seconds. Give it two minutes instead. Skip "hope you have a great day" and say one true thing: a memory from this year, something they did that you admired, or the reason the main gift made you think of them.</p>

<p>"Happy birthday. I saw this tin and heard you complaining that the shop on Queen stopped selling it." That line explains the whole gift. If you would like more wording to borrow, <a href="/guides/what-to-write-in-a-gift-message">our gift message guide</a> has examples for most occasions.</p>

<h2>If you would like us to make it</h2>

<p>Everything above can be done at your kitchen table. It can also be handed to us. Send a <a href="/custom-basket">custom request</a> with the occasion, the date, the main gift and anything to leave out, and we reply with a price before anything is charged. You can start from one of five presentation looks on that page, including a display box built around your photos and a bouquet with a small gift hidden in the flowers. The looks are starting points. What goes inside is decided with you.</p>

<p>Three things to know before you ask. Anything with fresh flowers needs two days' notice. We do not sell alcohol, so there is no wine or champagne in our gifts, though an alcohol-free sparkling drink can take its place. And if you tell us your budget at the start, the first quote will be the right one.</p>

<h2>When a ready-made basket is the right answer</h2>

<p>Not every birthday needs a project. For a colleague, a client or a friend you see twice a year, a well-chosen basket with a good card is plenty, and it is the card that makes it personal. Our <a href="/occasions/birthday">birthday baskets</a> are packed by hand after you order and delivered across the GTA or shipped within Canada. The <a href="/guides/birthday-gift-basket-ideas">birthday basket guide</a> sorts them by who they are for.</p>

<p>For a 30th, 40th, 50th or beyond, see the guide to <a href="/guides/milestone-birthday-gift-ideas-30th-40th-50th-60th-70th">milestone birthday gifts</a>. And for the person who insists they want nothing at all, <a href="/guides/birthday-gifts-for-someone-who-doesnt-want-anything">we have a guide for them too</a>.</p>`,
    fr: `<p>Pensez au plus beau cadeau d'anniversaire que vous ayez reçu. Ce n'était probablement pas le plus cher. C'était plutôt celui qui vous a fait dire « comment as-tu su? », parce que quelqu'un avait remarqué un petit détail à votre sujet et s'en était souvenu pendant des mois.</p>

<p>C'est tout ce que « spécial » veut dire pour un cadeau. Il n'aurait pu être remis à personne d'autre. La bonne nouvelle, c'est que cela demande de l'attention, pas de l'argent, et que presque tout peut se faire en une semaine. Voici les six choses qui font la différence, à peu près dans l'ordre où il faut y penser.</p>

<h2>1. Partez d'un détail que vous êtes seul à connaître</h2>

<p>Chaque personne a une courte liste de choses auxquelles elle tient. Le thé qu'elle commande par son nom. La tablette de chocolat de son enfance, difficile à trouver ici. La crème à mains qu'elle achète depuis l'université. La collation qu'elle cache aux enfants.</p>

<p>Un seul article de cette liste fait plus que dix belles choses prises sur une tablette, parce qu'il prouve que vous avez porté attention. Si rien ne vous vient, vous avez trois sources faciles : son armoire de cuisine, sa tablette de salle de bain et la personne qui vit avec elle. Un texto qui dit « qu'est-ce qui lui manque toujours? » obtient en général une réponse dans la minute.</p>

<p>Notez le détail le plus précisément possible, avec la marque, la saveur ou la teinte. « Du Earl Grey », c'est une supposition. « Le Earl Grey en feuilles dans la boîte jaune », c'est un cadeau.</p>

<h2>2. Donnez-lui un centre</h2>

<p>Un cadeau fait de plusieurs petites choses égales ressemble à des emplettes. Un cadeau avec un article principal et quelques autres autour a l'air pensé. Décidez donc ce qui est au centre : le parfum, le livre, les bons écouteurs, la photo encadrée. Laissez ensuite le reste l'accompagner. Du chocolat à côté d'un roman. Une bougie et des sels de bain à côté d'un peignoir. Du café et une tasse à côté d'un nouveau carnet.</p>

<p>Cela garde aussi le budget honnête. Mettez-en la plus grande part dans l'article principal et prenez la bonne version, puis complétez avec deux ou trois choses peu coûteuses qui se consomment. Si le cadeau principal est déjà acheté et qu'il ne reste qu'à le présenter, c'est un travail que nous faisons souvent. Notre guide pour <a href="/fr/guides/custom-gift-hamper-how-to-order">commander un panier-cadeau sur mesure</a> explique comment.</p>

<h2>3. Mettez-y une photo</h2>

<p>Nous transportons des milliers de photos dans nos téléphones et nous n'en imprimons presque aucune. C'est pour cela qu'une photo imprimée arrête encore les gens. Une bonne image dans un cadre simple transforme une boîte de belles choses en un objet qu'on garde sur une tablette une fois le chocolat fini.</p>

<p>Choisissez la photo d'un moment, pas d'une pose. Celle du chalet, un peu floue, vaut mieux que la photo de groupe où tout le monde regarde l'appareil. Utilisez le fichier d'origine de votre téléphone, pas une capture d'écran ni une copie enregistrée d'une conversation, qui s'impriment floues. Et une ou deux photos suffisent. Un cadeau d'anniversaire n'est pas un album.</p>

<h2>4. Faites de l'ouverture une partie du cadeau</h2>

<p>La façon dont un cadeau s'ouvre est la première chose que la personne vit, et c'est la partie la moins coûteuse à réussir. Si vous le préparez à la maison, quelques habitudes aident :</p>

<ul>
<li>Choisissez une seule couleur pour le papier de soie, le ruban et la carte, et tenez-vous-y.</li>
<li>Enlevez toutes les étiquettes de prix, y compris celle sous la boîte.</li>
<li>Placez l'article le plus haut à l'arrière et le cadeau principal là où le regard se pose d'abord.</li>
<li>Comblez les vides avec du papier de soie ou de la frisure pour que rien ne glisse quand on porte la boîte.</li>
<li>Emballez l'article principal à part dans la boîte, pour qu'il reste une chose de plus à ouvrir.</li>
</ul>

<p>Une boîte toute simple préparée avec soin a meilleure allure qu'un panier coûteux où les articles s'entrechoquent.</p>

<h2>5. Choisissez bien le moment</h2>

<p>Un cadeau d'anniversaire qui arrive le jour même dit que vous y avez pensé. Le même cadeau trois jours plus tard dit que vous avez fini par y penser. Si vous ne verrez pas la personne le jour de son anniversaire, faites livrer le cadeau pour qu'il soit là quand la journée commence, pas quand elle est terminée.</p>

<p>Deux points pratiques. S'il y a un souper ou une fête et que vous voulez que le cadeau soit ouvert avant, faites-le arriver la veille. Et si la personne est absente le jour même, envoyez-le là où elle sera, ou attendez son retour et dites-lui le jour de son anniversaire que quelque chose s'en vient. À Mississauga et dans le reste du Grand Toronto, une commande passée avant midi peut encore être livrée le jour même. Notre <a href="/fr/guides/same-day-gift-delivery-mississauga-toronto-gta">guide de la livraison le jour même</a> donne les heures limites et les frais pour chaque ville.</p>

<h2>6. Écrivez la carte en dernier, et écrivez-la bien</h2>

<p>La carte est la seule partie d'un cadeau qui vient entièrement de vous, et elle s'écrit d'habitude dans les dix dernières secondes. Donnez-lui plutôt deux minutes. Laissez tomber « passe une belle journée » et dites une chose vraie : un souvenir de cette année, un geste que vous avez admiré, ou la raison pour laquelle le cadeau principal vous a fait penser à elle.</p>

<p>« Bonne fête. J'ai vu cette boîte et je t'ai entendue te plaindre que la boutique de la rue Queen n'en vendait plus. » Cette phrase explique tout le cadeau. Pour d'autres formulations à emprunter, <a href="/fr/guides/what-to-write-in-a-gift-message">notre guide des messages-cadeaux</a> propose des exemples pour la plupart des occasions.</p>

<h2>Si vous préférez que nous le fassions</h2>

<p>Tout ce qui précède peut se faire sur votre table de cuisine. Vous pouvez aussi nous le confier. Envoyez une <a href="/fr/custom-basket">demande sur mesure</a> avec l'occasion, la date, le cadeau principal et ce qu'il faut éviter, et nous vous répondons avec un prix avant toute facturation. Vous pouvez partir de l'un des cinq styles de présentation montrés sur cette page, dont un coffret vitrine composé autour de vos photos et un bouquet avec un petit cadeau caché dans les fleurs. Les styles sont des points de départ. Le contenu se décide avec vous.</p>

<p>Trois choses à savoir avant de demander. Tout ce qui comporte des fleurs fraîches demande un préavis de deux jours. Nous ne vendons pas d'alcool, donc ni vin ni champagne dans nos cadeaux, mais un mousseux sans alcool peut prendre la place. Et si vous nous dites votre budget dès le départ, le premier devis sera le bon.</p>

<h2>Quand un panier tout fait est la bonne réponse</h2>

<p>Tous les anniversaires ne demandent pas un projet. Pour un collègue, un client ou une amie que vous voyez deux fois par année, un panier bien choisi avec une bonne carte suffit, et c'est la carte qui le rend personnel. Nos <a href="/fr/occasions/birthday">paniers d'anniversaire</a> sont emballés à la main après votre commande, puis livrés dans le Grand Toronto ou expédiés au Canada. Le <a href="/fr/guides/birthday-gift-basket-ideas">guide des paniers d'anniversaire</a> les classe selon la personne à qui ils sont destinés.</p>

<p>Pour des 30, 40 ou 50 ans et plus, consultez le guide des <a href="/fr/guides/milestone-birthday-gift-ideas-30th-40th-50th-60th-70th">cadeaux d'anniversaire marquant</a>. Et pour la personne qui répète qu'elle ne veut rien du tout, <a href="/fr/guides/birthday-gifts-for-someone-who-doesnt-want-anything">nous avons aussi un guide</a>.</p>`,
  },
};

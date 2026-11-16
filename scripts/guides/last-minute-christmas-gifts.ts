import type { GuideSeed } from "./types";

/**
 * The December "have I left it too late?" page. The other Christmas guides say
 * who to buy for; this one answers the deadline searches ("last day to order
 * for Christmas delivery", "same day Christmas gift delivery Mississauga",
 * "Christmas Eve gift delivery Toronto") with dates.
 *
 * Unlike the older guides, this one does state the noon same-day cutoff and
 * the 7 pm order cutoff, because a deadline page without the deadline is no
 * use. Both are business rules set on 3 Nov 2026 and live in the delivery
 * zones / `delivery.orderCutoff` setting: if either changes, change it here.
 *
 * Christmas 2026 is a Friday. The courier "order by" dates are advice with
 * padding on top of each zone's transit days (on-ground 2-4, on-north 2-5,
 * qc 3-5, prairies 3-5, atlantic 3-6, bc 4-6, on-northwest 4-6, nl 5-7), not
 * a courier commitment. Rewrite the table and every dated line each autumn in
 * both locales, then re-run the seeder with `--write --force`.
 *
 * No product names and no prices, same rule as the other guides.
 */
export const lastMinuteChristmasGifts: GuideSeed = {
  slug: "last-minute-christmas-gifts-gta-delivery-deadlines",
  category: "SEASONAL",
  readMinutes: 6,
  featured: false,
  title: {
    en: "Last-minute Christmas gifts: 2026 order deadlines and same-day delivery in the GTA",
    fr: "Cadeaux de Noël de dernière minute : dates limites 2026 et livraison le jour même dans le Grand Toronto",
  },
  excerpt: {
    en: "The last dates to order a Christmas gift for courier delivery across Canada in 2026, how same-day delivery works in Mississauga, Toronto and the GTA, what happens on Christmas Eve, and what to do once a deadline has passed.",
    fr: "Les dernières dates pour commander un cadeau de Noël expédié au Canada en 2026, le fonctionnement de la livraison le jour même à Mississauga, à Toronto et dans le Grand Toronto, ce qui se passe la veille de Noël et quoi faire quand une date limite est passée.",
  },
  seoTitle: {
    en: "Last-Minute Christmas Gifts in the GTA: 2026 Order Deadlines",
    fr: "Cadeaux de Noël de dernière minute : dates limites 2026",
  },
  seoDescription: {
    en: "Left Christmas late? The last dates to order for courier delivery across Canada in 2026, plus same-day gift basket delivery in Mississauga, Toronto and the GTA.",
    fr: "Noël approche trop vite? Les dernières dates pour commander un cadeau expédié au Canada en 2026 et la livraison de paniers le jour même à Mississauga et à Toronto.",
  },
  body: {
    en: `<p>Around the second week of December, a list that looked finished turns out to have a gap in it. A brother-in-law. The neighbour who shovelled your driveway twice. The aunt in Halifax who always sends something and has already sent it. Nothing has gone wrong yet. It only means the calendar now decides what you can send, and how.</p>

<p>This page is that calendar for 2026. Christmas Day falls on a Friday, so the last ordinary weekday for a delivery is Wednesday 23 December, with Christmas Eve on the Thursday.</p>

<h2>The short version</h2>

<ul>
<li>A gift travelling by courier to anywhere outside the GTA should be ordered by the dates in the table below. The earliest of them is Friday 4 December.</li>
<li>A gift going to Mississauga, Toronto or the surrounding GTA can be ordered right up to Christmas week, and an order placed before noon can be delivered the same day.</li>
<li>Durham Region and the north GTA get next-day delivery at the earliest.</li>
<li>Anything with fresh flowers, and any order of three or more baskets, needs two days.</li>
</ul>

<h2>If the gift is travelling by courier</h2>

<p>Everything outside our local delivery area goes with a tracked courier. Baskets are packed to order, and an order placed after 7 pm Eastern starts its preparation the next day, so count from the day after you order.</p>

<table>
<thead>
<tr><th>Going to</th><th>Usual transit</th><th>Order by</th></tr>
</thead>
<tbody>
<tr><td>Southern and eastern Ontario (Ottawa, London, Kingston, Windsor)</td><td>2 to 4 business days</td><td>Friday 11 December</td></tr>
<tr><td>Northern Ontario (Sudbury, North Bay, Thunder Bay)</td><td>2 to 5 business days</td><td>Wednesday 9 December</td></tr>
<tr><td>Quebec</td><td>3 to 5 business days</td><td>Wednesday 9 December</td></tr>
<tr><td>Manitoba, Saskatchewan and Alberta</td><td>3 to 5 business days</td><td>Wednesday 9 December</td></tr>
<tr><td>Nova Scotia, New Brunswick and PEI</td><td>3 to 6 business days</td><td>Monday 7 December</td></tr>
<tr><td>British Columbia</td><td>4 to 6 business days</td><td>Monday 7 December</td></tr>
<tr><td>Northwestern Ontario (Kenora, Dryden, Fort Frances)</td><td>4 to 6 business days</td><td>Friday 4 December</td></tr>
<tr><td>Newfoundland and Labrador</td><td>5 to 7 business days</td><td>Friday 4 December</td></tr>
</tbody>
</table>

<p>The transit times are what the courier normally takes. The order-by dates are our advice, and they are earlier than the arithmetic suggests on purpose, because December is the month when parcels sit in depots. They are not a guarantee. Once a parcel is with the courier, the last leg belongs to them, and one snowstorm on the 401 can add two days.</p>

<p>Two more things to check before you order. Not every basket can be shipped: the ones heavy on chocolate or with anything fresh stay local, each product page says which kind it is, and checkout warns you before you pay if something in your bag cannot reach the address. And Yukon and a few remote communities are priced by hand, so <a href="/contact">write to us</a> first. The full list of areas and costs is on the <a href="/shipping">delivery page</a>.</p>

<h3>If you have missed the courier date</h3>

<p>Don't gamble on it. A parcel that turns up on the 29th with a card saying "Merry Christmas" looks late. The same parcel with a card saying "Happy New Year" looks planned. Choose a delivery for the first week of January, write the card for the new year, and tell them on Christmas Day that something is on its way. People enjoy a gift that arrives once the house has gone quiet again.</p>

<h2>If the gift is staying in the GTA</h2>

<p>Local orders are delivered by our own drivers, which is why the deadline is so much later. Same-day delivery covers Mississauga, Toronto, Brampton, Oakville, Milton, Burlington, Georgetown, Bolton, Vaughan, Markham and Richmond Hill. Order before noon Eastern and the basket goes out that day: between 7 and 11 pm on a weekday, and through the day on a Saturday or Sunday. Order after noon and it goes the next day.</p>

<p>Durham Region and the north GTA (Pickering, Ajax, Whitby, Oshawa, Newmarket, Aurora and Caledon among them) are a longer drive, so the earliest there is the next day. For those addresses, treat Tuesday 22 December as the last comfortable day to order.</p>

<p>Delivery areas are set by postal code, not by city name. Enter the recipient's postal code at checkout, or look the city up on our <a href="/delivery">local delivery pages</a>, and you will see exactly which days are open and what delivery costs before you pay.</p>

<h3>The catch in December: days fill up</h3>

<p>We take a limited number of local deliveries each day so that every basket is packed properly and arrives when we said it would. Once a day is full, checkout offers the next open one. In the week before Christmas, the 22nd and 23rd go first.</p>

<p>You do not have to wait until the day you want it delivered. Checkout lets you pick the delivery date, so if you already know a basket should arrive on the 23rd, order it now and hold the date. Same-day delivery is the backstop for the gift you forgot. It should not be the plan for the gift you remembered.</p>

<h3>Flowers and larger orders</h3>

<p>Bouquets and the baskets that include fresh flowers need two days of preparation. So do orders of three or more baskets. Neither can go same-day. If you are down to your last 24 hours, choose from the food, coffee and tea or spa baskets. For more than ten baskets, <a href="/corporate/quote">ask for a quote</a> and we will tell you honestly whether the date is possible.</p>

<h2>Christmas Eve</h2>

<p>A local delivery on Thursday 24 December is possible while there are places left that day, but it is the riskiest day of the year to choose. People leave early for a family dinner, drive to a cottage or are at church by evening, and a basket waiting at an empty house on Christmas Eve is nobody's idea of a gift.</p>

<p>If it has to be the 24th, tell someone in the household that a delivery is coming, and put the recipient's phone number and any buzzer code in the delivery notes. Better still, pick the 22nd or the 23rd. Checkout only offers the days we are delivering, so if a date over the holidays does not appear, that day is closed or already full.</p>

<h2>Pickup</h2>

<p>If you will see the person yourself, pickup is free and avoids the delivery calendar altogether. Orders are collected from our studio at 5105 Hurontario Street in Mississauga, and checkout shows the earliest time yours can be ready. Baskets with flowers still need their two days.</p>

<h2>What to choose when there is no time to think</h2>

<p>Late gifts usually go wrong through overthinking, not through lack of time. Three choices cover nearly everyone. For a household, send food that can be shared: a <a href="/category/gourmet">gourmet</a> or <a href="/category/chocolate">chocolate</a> basket gets opened on Boxing Day and finished by New Year. For someone you do not know well, <a href="/category/coffee-tea">coffee and tea</a> is the least likely to miss. For whoever cooked Christmas dinner, a <a href="/category/spa-wellness">spa basket</a> says what a box of biscuits cannot.</p>

<p>If the person does not celebrate Christmas, the <a href="/occasions/holiday">holiday collection</a> has baskets without a tree or a Santa on them. For the people who are hard to buy for in any month, we wrote <a href="/guides/christmas-gift-ideas-for-family-and-friends">a separate guide</a>, and there is one on <a href="/guides/christmas-host-gifts-what-to-bring-to-christmas-dinner">what to bring to Christmas dinner</a>.</p>

<h2>Let the card do the work</h2>

<p>Every basket comes with a printed message card, and on a late gift the card matters more than the contents. Nobody remembers which day a parcel came. They remember what it said.</p>

<ul>
<li>"Merry Christmas. I'm sorry we can't be there this year. Open this on the day and think of us."</li>
<li>"You did all the cooking, so this one is only for you. Merry Christmas."</li>
<li>For a gift that will arrive after the 25th: "This was meant to reach you before Christmas and didn't. Happy New Year, with love from all of us."</li>
</ul>

<p>There are more examples in <a href="/guides/what-to-write-in-a-gift-message">what to write in a gift message</a>.</p>

<h2>A late gift for a client or a team</h2>

<p>Offices empty out before homes do. Many close on Friday 18 December, and by the 23rd there is rarely anyone at reception to take a delivery. If a business gift is running late, send it to the person's home if you have the address, or schedule it for the first working week of January, when it will be the only parcel on the desk. Our guide to <a href="/guides/christmas-gifts-for-clients-employees-coworkers">Christmas gifts at work</a> covers the rest.</p>

<p>If you are reading this with days to spare, start with the <a href="/occasions/christmas">Christmas gift baskets</a> and pick your delivery date at checkout. If you are reading it on the morning of the 23rd, the same page still works. Order before noon, and checkout will tell you whether today still has room.</p>`,

    fr: `<p>Vers la deuxième semaine de décembre, une liste qu'on croyait terminée révèle un trou. Un beau-frère. Le voisin qui a pelleté votre entrée deux fois. La tante de Halifax qui envoie toujours quelque chose, et dont le colis est déjà arrivé. Rien n'est encore raté. Cela veut seulement dire que c'est maintenant le calendrier qui décide de ce que vous pouvez envoyer, et comment.</p>

<p>Cette page est ce calendrier pour 2026. Noël tombe un vendredi : le dernier jour de semaine ordinaire pour une livraison est donc le mercredi 23 décembre, et la veille de Noël tombe le jeudi.</p>

<h2>En bref</h2>

<ul>
<li>Un cadeau expédié par messager hors du Grand Toronto devrait être commandé avant les dates du tableau ci-dessous. La plus hâtive est le vendredi 4 décembre.</li>
<li>Un cadeau destiné à Mississauga, à Toronto ou aux environs peut être commandé jusque dans la semaine de Noël, et une commande passée avant midi peut être livrée le jour même.</li>
<li>La région de Durham et le nord du Grand Toronto sont livrés le lendemain au plus tôt.</li>
<li>Tout ce qui contient des fleurs fraîches, et toute commande de trois paniers ou plus, demande deux jours.</li>
</ul>

<h2>Si le cadeau voyage par messager</h2>

<p>Tout ce qui sort de notre zone de livraison locale part avec un messager offrant le suivi. Les paniers sont préparés sur commande, et une commande passée après 19 h (heure de l'Est) commence sa préparation le lendemain : comptez donc à partir du jour suivant votre commande.</p>

<table>
<thead>
<tr><th>Destination</th><th>Délai habituel</th><th>Commandez avant</th></tr>
</thead>
<tbody>
<tr><td>Sud et est de l'Ontario (Ottawa, London, Kingston, Windsor)</td><td>2 à 4 jours ouvrables</td><td>Le vendredi 11 décembre</td></tr>
<tr><td>Nord de l'Ontario (Sudbury, North Bay, Thunder Bay)</td><td>2 à 5 jours ouvrables</td><td>Le mercredi 9 décembre</td></tr>
<tr><td>Québec</td><td>3 à 5 jours ouvrables</td><td>Le mercredi 9 décembre</td></tr>
<tr><td>Manitoba, Saskatchewan et Alberta</td><td>3 à 5 jours ouvrables</td><td>Le mercredi 9 décembre</td></tr>
<tr><td>Nouvelle-Écosse, Nouveau-Brunswick et Île-du-Prince-Édouard</td><td>3 à 6 jours ouvrables</td><td>Le lundi 7 décembre</td></tr>
<tr><td>Colombie-Britannique</td><td>4 à 6 jours ouvrables</td><td>Le lundi 7 décembre</td></tr>
<tr><td>Nord-ouest de l'Ontario (Kenora, Dryden, Fort Frances)</td><td>4 à 6 jours ouvrables</td><td>Le vendredi 4 décembre</td></tr>
<tr><td>Terre-Neuve-et-Labrador</td><td>5 à 7 jours ouvrables</td><td>Le vendredi 4 décembre</td></tr>
</tbody>
</table>

<p>Les délais indiqués sont ceux que le messager prend normalement. Les dates de commande sont notre conseil, et elles sont volontairement plus hâtives que le calcul ne le suggère, parce que décembre est le mois où les colis attendent dans les entrepôts. Ce n'est pas une garantie. Une fois le colis confié au messager, la dernière étape lui appartient, et une seule tempête de neige sur la 401 peut ajouter deux jours.</p>

<p>Deux autres points à vérifier avant de commander. Tous les paniers ne s'expédient pas : ceux qui contiennent beaucoup de chocolat ou des produits frais restent locaux, chaque fiche produit le précise, et la caisse vous prévient avant le paiement si un article ne peut pas se rendre à l'adresse. Et le Yukon ainsi que quelques communautés éloignées font l'objet d'un prix établi à la main : <a href="/fr/contact">écrivez-nous</a> d'abord. La liste complète des secteurs et des tarifs se trouve sur la <a href="/fr/shipping">page de livraison</a>.</p>

<h3>Si vous avez raté la date du messager</h3>

<p>Ne tentez pas le coup. Un colis qui arrive le 29 avec une carte « Joyeux Noël » a l'air en retard. Le même colis avec une carte « Bonne année » a l'air prévu. Choisissez une livraison pour la première semaine de janvier, écrivez la carte pour la nouvelle année et dites à la personne, le jour de Noël, que quelque chose s'en vient. On apprécie un cadeau qui arrive quand la maison est redevenue calme.</p>

<h2>Si le cadeau reste dans le Grand Toronto</h2>

<p>Les commandes locales sont livrées par nos propres livreurs, et c'est pourquoi la date limite est tellement plus tardive. La livraison le jour même couvre Mississauga, Toronto, Brampton, Oakville, Milton, Burlington, Georgetown, Bolton, Vaughan, Markham et Richmond Hill. Commandez avant midi (heure de l'Est) et le panier part le jour même : entre 19 h et 23 h en semaine, et au fil de la journée le samedi et le dimanche. Après midi, il part le lendemain.</p>

<p>La région de Durham et le nord du Grand Toronto (Pickering, Ajax, Whitby, Oshawa, Newmarket, Aurora et Caledon, entre autres) sont plus loin : le plus tôt possible, c'est le lendemain. Pour ces adresses, considérez le mardi 22 décembre comme le dernier jour confortable pour commander.</p>

<p>Les secteurs de livraison dépendent du code postal, pas du nom de la ville. Entrez le code postal du destinataire à la caisse, ou cherchez la ville dans nos <a href="/fr/delivery">pages de livraison locale</a> : vous verrez exactement quels jours sont ouverts et ce que coûte la livraison avant de payer.</p>

<h3>Le piège de décembre : les journées se remplissent</h3>

<p>Nous acceptons un nombre limité de livraisons locales par jour, pour que chaque panier soit bien préparé et arrive au moment promis. Quand une journée est complète, la caisse propose la suivante. Dans la semaine avant Noël, le 22 et le 23 partent en premier.</p>

<p>Vous n'avez pas à attendre le jour où vous voulez la livraison. La caisse vous laisse choisir la date : si vous savez déjà qu'un panier doit arriver le 23, commandez-le maintenant et réservez la journée. La livraison le jour même est le filet de sécurité pour le cadeau oublié. Elle ne devrait pas être le plan pour celui auquel vous avez pensé.</p>

<h3>Les fleurs et les commandes plus grosses</h3>

<p>Les bouquets et les paniers qui contiennent des fleurs fraîches demandent deux jours de préparation. Les commandes de trois paniers ou plus aussi. Ni les uns ni les autres ne peuvent partir le jour même. S'il ne vous reste que 24 heures, choisissez parmi les paniers gourmands, café et thé ou spa. Pour plus de dix paniers, <a href="/fr/corporate/quote">demandez une soumission</a> et nous vous dirons franchement si la date est possible.</p>

<h2>La veille de Noël</h2>

<p>Une livraison locale le jeudi 24 décembre est possible tant qu'il reste des places ce jour-là, mais c'est la journée la plus risquée de l'année. Les gens partent tôt pour un souper de famille, prennent la route du chalet ou sont à l'église en soirée, et un panier qui attend devant une maison vide le 24 n'est un cadeau pour personne.</p>

<p>S'il faut absolument que ce soit le 24, prévenez quelqu'un de la maisonnée qu'une livraison s'en vient, et inscrivez le numéro de téléphone du destinataire et le code d'interphone dans les notes de livraison. Mieux encore, choisissez le 22 ou le 23. La caisse ne propose que les jours où nous livrons : si une date des Fêtes n'apparaît pas, c'est que la journée est fermée ou déjà complète.</p>

<h2>Le ramassage</h2>

<p>Si vous verrez la personne vous-même, le ramassage est gratuit et vous libère du calendrier de livraison. Les commandes se récupèrent à notre atelier du 5105, rue Hurontario à Mississauga, et la caisse indique l'heure la plus hâtive à laquelle la vôtre peut être prête. Les paniers avec fleurs demandent quand même leurs deux jours.</p>

<h2>Quoi choisir quand on n'a pas le temps de réfléchir</h2>

<p>Les cadeaux tardifs ratent le plus souvent parce qu'on réfléchit trop, pas parce qu'on manque de temps. Trois choix couvrent presque tout le monde. Pour une maisonnée, envoyez quelque chose qui se partage : un panier <a href="/fr/category/gourmet">gourmand</a> ou de <a href="/fr/category/chocolate">chocolat</a> s'ouvre le lendemain de Noël et se termine avant le jour de l'An. Pour quelqu'un que vous connaissez peu, le <a href="/fr/category/coffee-tea">café et le thé</a> sont le choix qui risque le moins de tomber à côté. Pour la personne qui a préparé le souper de Noël, un <a href="/fr/category/spa-wellness">panier spa</a> dit ce qu'une boîte de biscuits ne peut pas dire.</p>

<p>Si la personne ne fête pas Noël, la <a href="/fr/occasions/holiday">collection des Fêtes</a> propose des paniers sans sapin ni père Noël. Pour les gens difficiles à gâter peu importe le mois, nous avons écrit <a href="/fr/guides/christmas-gift-ideas-for-family-and-friends">un guide à part</a>, et il y en a un sur <a href="/fr/guides/christmas-host-gifts-what-to-bring-to-christmas-dinner">quoi apporter au souper de Noël</a>.</p>

<h2>Laissez la carte faire le travail</h2>

<p>Chaque panier est accompagné d'une carte-message imprimée, et pour un cadeau tardif, la carte compte plus que le contenu. Personne ne se souvient du jour où un colis est arrivé. On se souvient de ce qui était écrit.</p>

<ul>
<li>« Joyeux Noël. Nous sommes désolés de ne pas pouvoir être là cette année. Ouvrez ceci le jour même en pensant à nous. »</li>
<li>« Tu as fait toute la cuisine, alors celui-ci est seulement pour toi. Joyeux Noël. »</li>
<li>Pour un cadeau qui arrivera après le 25 : « Ceci devait arriver avant Noël, et ce n'est pas le cas. Bonne année, avec tout notre amour. »</li>
</ul>

<p>Vous trouverez d'autres exemples dans <a href="/fr/guides/what-to-write-in-a-gift-message">quoi écrire dans un message de cadeau</a>.</p>

<h2>Un cadeau tardif pour un client ou une équipe</h2>

<p>Les bureaux se vident avant les maisons. Beaucoup ferment le vendredi 18 décembre, et le 23, il n'y a souvent plus personne à l'accueil pour recevoir une livraison. Si un cadeau d'affaires prend du retard, envoyez-le au domicile de la personne si vous avez l'adresse, ou planifiez-le pour la première semaine de travail de janvier, où il sera le seul colis sur le bureau. Notre guide sur <a href="/fr/guides/christmas-gifts-for-clients-employees-coworkers">les cadeaux de Noël au travail</a> couvre le reste.</p>

<p>Si vous lisez ceci avec quelques jours devant vous, commencez par les <a href="/fr/occasions/christmas">paniers-cadeaux de Noël</a> et choisissez votre date de livraison à la caisse. Si vous le lisez le matin du 23, la même page fonctionne encore. Commandez avant midi, et la caisse vous dira s'il reste de la place aujourd'hui.</p>`,
  },
};

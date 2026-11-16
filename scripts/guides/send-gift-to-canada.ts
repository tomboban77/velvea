import type { GuideSeed } from "./types";

/**
 * For the buyer who is not in Canada: family overseas, parents of students in
 * the GTA, Canadians abroad. Targets "send a gift to Canada from USA / UK /
 * India", "send Christmas gift to Toronto from abroad", "do I pay customs on a
 * gift sent to Canada". Christmas-led because that is when the search peaks,
 * but the slug is evergreen and the closing says it holds for any occasion.
 *
 * Outside facts, checked 15 Nov 2026:
 *  - CBSA: a gift from a friend or relative worth CAN$60 or less enters free
 *    of duty and tax; above that, duty and tax apply to the amount over $60;
 *    alcohol, tobacco and anything a business sends do not qualify.
 *    https://www.cbsa-asfc.gc.ca/import/courier/menu-eng.html
 *  - The time-zone table is for December (Eastern STANDARD time, UTC-5). In
 *    summer the Eastern side shifts an hour and several rows change.
 *
 * Our own facts: noon same-day cutoff in the GTA, courier to the provinces,
 * no NWT/Nunavut, alcohol-free catalogue, prices in CAD. Checkout only takes
 * Canadian delivery addresses; the buyer's card can be from anywhere Stripe
 * accepts. No product names and no prices.
 */
export const sendGiftToCanada: GuideSeed = {
  slug: "send-a-gift-to-canada-from-usa-uk-abroad",
  category: "SEASONAL",
  readMinutes: 7,
  featured: false,
  title: {
    en: "How to send a Christmas gift to someone in Canada when you live abroad",
    fr: "Comment envoyer un cadeau de Noël à quelqu'un au Canada quand on vit à l'étranger",
  },
  excerpt: {
    en: "Posting a parcel to Canada means customs forms, a CAN$60 gift limit and weeks in transit. Ordering from a shop inside Canada means none of that. Here is how each works, what it costs, and what you need to have ready, from the US, the UK, India or anywhere else.",
    fr: "Poster un colis vers le Canada, c'est une déclaration de douane, une limite de 60 $ CA pour les cadeaux et des semaines de transport. Commander dans une boutique au Canada évite tout cela. Voici comment chaque option fonctionne, ce qu'elle coûte et ce qu'il faut avoir sous la main, que vous soyez en France, aux États-Unis ou ailleurs.",
  },
  seoTitle: {
    en: "Send a Christmas Gift to Canada from the US, UK or Abroad",
    fr: "Envoyer un cadeau de Noël au Canada depuis l'étranger",
  },
  seoDescription: {
    en: "Sending a gift to family in Canada from the US, UK, India or elsewhere? The customs rules, the CAN$60 gift limit, and how ordering from a Canadian shop avoids both.",
    fr: "Vous envoyez un cadeau à un proche au Canada depuis la France, les États-Unis ou ailleurs? Les règles de douane, la limite de 60 $ CA et la solution d'une boutique canadienne.",
  },
  body: {
    en: `<p>If someone you love lives in Canada and you do not, Christmas comes with a logistics problem. It might be a daughter at university in Toronto, parents who moved to Mississauga to be near the grandchildren, or an old friend who took a job in Calgary. You have two ways to get a present to them. You can post a parcel across the border, or you can have something delivered from inside the country. One is a great deal more trouble than the other.</p>

<h2>Option one: posting a parcel yourself</h2>

<p>This is what most people try first, and for something only you can give (a hand-knitted scarf, family photographs) it is still the right choice. For anything you could buy, think about three things first.</p>

<h3>Cost and time</h3>

<p>International postage on a box of any weight often costs more than what is inside it. It is also slow. Postal services publish their last posting dates for Christmas every autumn, and the dates for Canada usually fall in early December, or earlier still for the cheaper services. After that you are paying for an express courier.</p>

<h3>Customs and the CAN$60 rule</h3>

<p>Every parcel entering Canada passes the Canada Border Services Agency. Under <a href="https://www.cbsa-asfc.gc.ca/import/courier/menu-eng.html">its rules for gifts sent by mail or courier</a>, a present from a friend or relative comes in free of duty and tax if it is worth CAN$60 or less. If it is worth more, duty and tax are charged on the amount above $60. The bill goes to the person receiving it, usually with a handling fee from the carrier on top. A generous present can leave your mother paying at the door for the privilege of opening it.</p>

<p>The parcel needs a customs declaration that describes the contents, gives an honest value and marks it as a gift. Alcohol and tobacco never qualify, whatever they cost. Food has rules of its own: meat, dairy, fresh fruit and plants are restricted, so check before you pack anything fresh or homemade.</p>

<h3>The trap with online shops in your own country</h3>

<p>Many people skip the post office and order from a shop at home that ships internationally. The $60 exemption does not cover that. It is for gifts from one person to another, and a parcel sent by a business is treated as an ordinary import, with much lower limits. The order confirmation says "gift". The border sees a retail shipment, and the recipient may be asked for tax and duty before the parcel is handed over.</p>

<h2>Option two: order from a shop inside Canada</h2>

<p>A gift bought from a Canadian business and delivered to a Canadian address never crosses a border. There is no declaration to fill in and no duty, and nobody at the other end has to pay anything. It also takes days, not weeks, which matters if it is already December.</p>

<p>This is what we do. Velvéa is a gift studio in Mississauga, Ontario. Our own drivers deliver across Mississauga, Toronto and the Greater Toronto Area, and a tracked courier takes baskets to the rest of Ontario, Quebec, the Atlantic provinces, the Prairies and British Columbia. We do not deliver to the Northwest Territories or Nunavut, and Yukon is quoted individually. The <a href="/shipping">delivery page</a> lists every area, with costs and times.</p>

<h2>Paying from another country</h2>

<p>Prices on the site are in Canadian dollars. You pay with your own card, the charge is made in Canadian dollars, and your bank converts it at its rate that day. Some banks add a foreign transaction fee, often two or three percent, and that is the only extra to expect. We add nothing for an overseas card.</p>

<p>If the payment is declined, the usual reason is that your bank has blocked an unfamiliar foreign charge. A tap in the banking app or one phone call normally clears it, and the second attempt goes through. The receipt and the delivery updates come to your email, not to the person receiving the gift.</p>

<h2>Mind the time difference</h2>

<p>For addresses in the Greater Toronto Area, an order placed before noon Eastern Time can be delivered the same day. Noon in Toronto is later than you might think where you are. In December it works out as follows:</p>

<table>
<thead>
<tr><th>Where you are</th><th>Noon in Toronto is</th></tr>
</thead>
<tbody>
<tr><td>Los Angeles, Vancouver</td><td>9:00 am</td></tr>
<tr><td>London, Lisbon</td><td>5:00 pm</td></tr>
<tr><td>Paris, Berlin</td><td>6:00 pm</td></tr>
<tr><td>Dubai</td><td>9:00 pm</td></tr>
<tr><td>Delhi, Mumbai</td><td>10:30 pm</td></tr>
<tr><td>Manila, Hong Kong</td><td>1:00 am the next day</td></tr>
<tr><td>Sydney</td><td>4:00 am the next day</td></tr>
</tbody>
</table>

<p>You do not need to hit the cutoff. Checkout lets you choose the delivery date, so the simpler way is to order a few days ahead and pick the day you want it to arrive. Near Christmas, do it early, because the days just before the 25th fill up. Our <a href="/guides/last-minute-christmas-gifts-gta-delivery-deadlines">Christmas deadlines guide</a> has the last order dates for every part of the country.</p>

<h2>What to have ready before you order</h2>

<p>Most problems with a gift sent from far away come down to the address. Before you start, get these from the person or from someone close to them:</p>

<ul>
<li>The full street address, with the apartment or unit number.</li>
<li>The postal code, in the Canadian format of letter, number, letter, then number, letter, number (L5B 1M2, for example). It decides the delivery area, and checkout checks that it matches the city.</li>
<li>A Canadian phone number for the recipient, so the driver or courier can reach them.</li>
<li>The buzzer code or the concierge desk, if it is an apartment or condo building.</li>
<li>Any day they will be away. Many people travel between the 20th and the new year.</li>
</ul>

<p>If you want it to be a surprise, a sibling, a roommate or a neighbour can usually supply all of this without giving anything away.</p>

<h2>Where it is going changes what to send</h2>

<h3>A student in residence or a shared apartment</h3>

<p>Students are the hardest to time. Exams finish in the middle of December, most students leave straight afterwards, and many university residences close over the break. Send the gift to arrive before their last exam, or send it to wherever they will spend Christmas. For a residence, add the room number and their phone number, since parcels are held at a front desk or mailroom. Food they can share with roommates is usually the right choice: a <a href="/category/gourmet">snack basket</a> or <a href="/category/coffee-tea">coffee and tea</a> gets a student through exam week.</p>

<h3>Parents or grandparents</h3>

<p>Choose something the household can open together, such as a <a href="/category/chocolate">chocolate</a> or gourmet basket, and ask whoever does their shopping what they can and cannot eat. Every basket we make is alcohol-free. Each product page lists what is inside, and there is a small <a href="/category/vegan">vegan selection</a>. If you are unsure about a diet, <a href="/contact">ask us</a> before you order. Our <a href="/recipients/family">family gift baskets</a> are the place to start.</p>

<h3>Someone outside the Toronto area</h3>

<p>Anything going beyond our local area travels by courier, which takes a few business days and is limited to the baskets marked as shippable. Those heavy on chocolate or with fresh flowers stay local. Checkout tells you before you pay if a basket cannot reach the address.</p>

<h2>Should it be a surprise?</h2>

<p>Keep what it is a surprise. Don't keep the delivery itself a secret. A message saying "something is coming to you on Tuesday, be home in the evening" spoils nothing, and it means the basket is taken inside and not left in a lobby while they are out. In a Canadian December, that matters. Nobody wants a gift sitting on a porch at minus ten.</p>

<h2>The card matters more when you are far away</h2>

<p>Every gift goes out with a printed message card, and for someone who has not seen you in a year, the card is the part they keep. Write it the way you would speak to them.</p>

<ul>
<li>"Merry Christmas from all of us at home. We wish we were at your table this year. Save us a place for the next one."</li>
<li>"Good luck with exams, and Merry Christmas. Share this with your roommates, or don't. Love, Mum and Dad."</li>
<li>"Your first Christmas in the new house. We are thinking of you and already planning the visit."</li>
</ul>

<p>There are more examples in <a href="/guides/what-to-write-in-a-gift-message">what to write in a gift message</a>.</p>

<p>None of this is special to Christmas. Birthdays, anniversaries, a new baby and a hard week all work the same way from abroad. For now, start with the <a href="/occasions/christmas">Christmas gift baskets</a> or the wider <a href="/occasions/holiday">holiday collection</a>. If the order is unusual, with several addresses or a date you are not sure about, <a href="/contact">write to us</a> and a person will answer.</p>`,

    fr: `<p>Quand une personne qui vous est chère vit au Canada et que vous n'y vivez pas, Noël vient avec un problème de logistique. C'est peut-être une fille à l'université à Toronto, des parents installés à Mississauga pour se rapprocher des petits-enfants, ou un vieil ami parti travailler à Calgary. Vous avez deux façons de leur faire parvenir un cadeau. Vous pouvez poster un colis qui traversera la frontière, ou faire livrer quelque chose depuis l'intérieur du pays. L'une donne beaucoup plus de mal que l'autre.</p>

<h2>Première option : poster un colis vous-même</h2>

<p>C'est ce que la plupart des gens essaient d'abord, et pour ce que vous seul pouvez offrir (un foulard tricoté à la main, des photos de famille), cela reste le bon choix. Pour tout ce qui s'achète, pensez d'abord à trois choses.</p>

<h3>Le coût et le délai</h3>

<p>L'affranchissement international d'une boîte le moindrement lourde coûte souvent plus cher que son contenu. C'est aussi lent. Les services postaux publient chaque automne leurs dates limites d'envoi pour Noël, et celles pour le Canada tombent généralement au début de décembre, ou plus tôt encore pour les services économiques. Passé ces dates, il faut payer un service express.</p>

<h3>La douane et la règle des 60 $ CA</h3>

<p>Chaque colis qui entre au Canada passe par l'Agence des services frontaliers du Canada. Selon <a href="https://www.cbsa-asfc.gc.ca/import/courier/menu-fra.html">ses règles sur les cadeaux envoyés par la poste ou par messagerie</a>, un cadeau d'un ami ou d'un proche entre sans droits ni taxes s'il vaut 60 $ CA ou moins. S'il vaut davantage, les droits et les taxes s'appliquent au montant qui dépasse 60 $. La facture va à la personne qui reçoit le colis, souvent avec des frais de traitement du transporteur en plus. Un cadeau généreux peut obliger votre mère à payer à la porte pour avoir le droit de l'ouvrir.</p>

<p>Le colis doit porter une déclaration de douane qui décrit le contenu, indique une valeur honnête et précise qu'il s'agit d'un cadeau. L'alcool et le tabac ne sont jamais admissibles, peu importe leur prix. Les aliments ont leurs propres règles : la viande, les produits laitiers, les fruits frais et les plantes sont restreints. Vérifiez avant d'emballer quoi que ce soit de frais ou de fait maison.</p>

<h3>Le piège des boutiques en ligne de votre pays</h3>

<p>Beaucoup de gens évitent le bureau de poste et commandent dans une boutique de leur pays qui livre à l'international. L'exemption de 60 $ ne couvre pas ce cas. Elle vise les cadeaux d'une personne à une autre, et un colis expédié par une entreprise est traité comme une importation ordinaire, avec des limites beaucoup plus basses. La confirmation de commande dit « cadeau ». La frontière voit un envoi commercial, et la personne peut devoir payer des taxes et des droits avant qu'on lui remette le colis.</p>

<h2>Deuxième option : commander dans une boutique au Canada</h2>

<p>Un cadeau acheté d'une entreprise canadienne et livré à une adresse canadienne ne traverse aucune frontière. Il n'y a ni déclaration à remplir ni droits, et personne n'a rien à payer à l'arrivée. Il faut aussi compter des jours, pas des semaines, ce qui compte si décembre est déjà commencé.</p>

<p>C'est ce que nous faisons. Velvéa est un atelier de cadeaux situé à Mississauga, en Ontario. Nos propres livreurs desservent Mississauga, Toronto et la région du Grand Toronto, et un messager offrant le suivi apporte les paniers dans le reste de l'Ontario, au Québec, dans les provinces de l'Atlantique, dans les Prairies et en Colombie-Britannique. Nous ne livrons pas dans les Territoires du Nord-Ouest ni au Nunavut, et le Yukon fait l'objet d'un prix sur demande. La <a href="/fr/shipping">page de livraison</a> présente chaque secteur, avec les tarifs et les délais.</p>

<h2>Payer depuis un autre pays</h2>

<p>Les prix du site sont en dollars canadiens. Vous payez avec votre propre carte, le montant est débité en dollars canadiens et votre banque le convertit au taux du jour. Certaines banques ajoutent des frais d'opération à l'étranger, souvent de deux ou trois pour cent, et c'est le seul supplément à prévoir. Nous n'ajoutons rien pour une carte étrangère.</p>

<p>Si le paiement est refusé, c'est le plus souvent parce que votre banque a bloqué un achat étranger inhabituel. Une confirmation dans l'application bancaire ou un appel règle normalement la question, et le deuxième essai passe. Le reçu et les avis de livraison arrivent à votre adresse courriel, pas à celle de la personne qui reçoit le cadeau.</p>

<h2>Attention au décalage horaire</h2>

<p>Pour les adresses du Grand Toronto, une commande passée avant midi, heure de l'Est, peut être livrée le jour même. Midi à Toronto, c'est plus tard qu'on le croit là où vous êtes. En décembre, cela donne ceci :</p>

<table>
<thead>
<tr><th>Où vous êtes</th><th>Midi à Toronto, c'est</th></tr>
</thead>
<tbody>
<tr><td>Los Angeles, Vancouver</td><td>9 h</td></tr>
<tr><td>Londres, Lisbonne</td><td>17 h</td></tr>
<tr><td>Paris, Bruxelles, Genève</td><td>18 h</td></tr>
<tr><td>Beyrouth</td><td>19 h</td></tr>
<tr><td>Dubaï</td><td>21 h</td></tr>
<tr><td>Delhi, Mumbai</td><td>22 h 30</td></tr>
<tr><td>Sydney</td><td>4 h le lendemain</td></tr>
</tbody>
</table>

<p>Vous n'avez pas à respecter cette heure limite. La caisse vous laisse choisir la date de livraison : le plus simple est donc de commander quelques jours d'avance et de choisir le jour où le cadeau doit arriver. À l'approche de Noël, faites-le tôt, car les jours qui précèdent le 25 se remplissent. Notre <a href="/fr/guides/last-minute-christmas-gifts-gta-delivery-deadlines">guide des dates limites de Noël</a> donne les dernières dates de commande pour chaque région du pays.</p>

<h2>Ce qu'il faut avoir sous la main avant de commander</h2>

<p>La plupart des problèmes d'un cadeau envoyé de loin viennent de l'adresse. Avant de commencer, obtenez ceci de la personne ou de quelqu'un de son entourage :</p>

<ul>
<li>L'adresse complète, avec le numéro d'appartement ou d'unité.</li>
<li>Le code postal, au format canadien : lettre, chiffre, lettre, puis chiffre, lettre, chiffre (L5B 1M2, par exemple). C'est lui qui détermine le secteur de livraison, et la caisse vérifie qu'il correspond à la ville.</li>
<li>Un numéro de téléphone canadien pour le destinataire, afin que le livreur ou le messager puisse le joindre.</li>
<li>Le code d'interphone ou le comptoir du concierge, s'il s'agit d'un immeuble d'appartements ou de condos.</li>
<li>Les jours où la personne sera absente. Beaucoup de gens voyagent entre le 20 décembre et le jour de l'An.</li>
</ul>

<p>Si vous voulez garder la surprise, un frère ou une sœur, un colocataire ou un voisin peut généralement fournir tout cela sans rien dévoiler.</p>

<h2>La destination change ce qu'il faut envoyer</h2>

<h3>Un étudiant en résidence ou en colocation</h3>

<p>Les étudiants sont les plus difficiles à joindre au bon moment. Les examens se terminent à la mi-décembre, la plupart des étudiants partent aussitôt, et beaucoup de résidences universitaires ferment pendant le congé. Faites arriver le cadeau avant le dernier examen, ou envoyez-le là où la personne passera Noël. Pour une résidence, ajoutez le numéro de chambre et son numéro de téléphone, puisque les colis sont gardés à l'accueil ou à la salle du courrier. Quelque chose à partager avec les colocataires est généralement le bon choix : un <a href="/fr/category/gourmet">panier de collations</a> ou de <a href="/fr/category/coffee-tea">café et thé</a> aide à traverser la semaine d'examens.</p>

<h3>Des parents ou des grands-parents</h3>

<p>Choisissez quelque chose que la maisonnée peut ouvrir ensemble, comme un panier de <a href="/fr/category/chocolate">chocolat</a> ou un panier gourmand, et demandez à la personne qui fait leurs courses ce qu'ils peuvent manger ou non. Tous nos paniers sont sans alcool. Chaque fiche produit indique le contenu, et il existe une petite <a href="/fr/category/vegan">sélection végétalienne</a>. En cas de doute sur un régime alimentaire, <a href="/fr/contact">écrivez-nous</a> avant de commander. Nos <a href="/fr/recipients/family">paniers-cadeaux pour la famille</a> sont un bon point de départ.</p>

<h3>Quelqu'un hors de la région de Toronto</h3>

<p>Tout ce qui sort de notre zone locale voyage par messager, ce qui prend quelques jours ouvrables et se limite aux paniers indiqués comme expédiables. Ceux qui contiennent beaucoup de chocolat ou des fleurs fraîches restent locaux. La caisse vous prévient avant le paiement si un panier ne peut pas se rendre à l'adresse.</p>

<h2>Faut-il garder la surprise?</h2>

<p>Gardez la surprise sur le contenu. Ne faites pas de la livraison elle-même un secret. Un message qui dit « quelque chose arrive chez toi mardi, sois à la maison en soirée » ne gâche rien, et le panier sera rentré au lieu d'attendre dans un hall pendant que la personne est sortie. En décembre au Canada, cela compte. Personne ne veut d'un cadeau qui attend sur un perron à moins dix.</p>

<h2>La carte compte davantage quand on est loin</h2>

<p>Chaque cadeau part avec une carte-message imprimée, et pour quelqu'un qui ne vous a pas vu depuis un an, la carte est ce qu'on garde. Écrivez-la comme vous lui parleriez.</p>

<ul>
<li>« Joyeux Noël de nous tous à la maison. Nous aurions aimé être à ta table cette année. Garde-nous une place pour la prochaine. »</li>
<li>« Bonne chance pour tes examens, et joyeux Noël. Partage avec tes colocs, ou pas. Papa et maman, qui t'aiment. »</li>
<li>« Votre premier Noël dans la nouvelle maison. Nous pensons à vous et nous préparons déjà la visite. »</li>
</ul>

<p>Vous trouverez d'autres exemples dans <a href="/fr/guides/what-to-write-in-a-gift-message">quoi écrire dans un message de cadeau</a>.</p>

<p>Rien de tout cela n'est propre à Noël. Un anniversaire, un anniversaire de mariage, une naissance ou une semaine difficile fonctionnent de la même façon depuis l'étranger. Pour l'instant, commencez par les <a href="/fr/occasions/christmas">paniers-cadeaux de Noël</a> ou par la <a href="/fr/occasions/holiday">collection des Fêtes</a>, plus large. Si la commande sort de l'ordinaire, avec plusieurs adresses ou une date dont vous n'êtes pas sûr, <a href="/fr/contact">écrivez-nous</a> et une personne vous répondra.</p>`,
  },
};

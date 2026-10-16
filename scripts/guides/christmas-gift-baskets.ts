import type { GuideSeed } from "./types";

/**
 * Christmas is the biggest gifting search window of the year, and the
 * Ontario gifting calendar guide only touches it in passing. This one is the
 * December page: who people send to (the long list, not only family), what
 * travels, and when to order, with the corporate side handed to the two
 * corporate guides instead of repeated.
 *
 * Christmas 2026 falls on a Friday. The delivery table and the "order by"
 * lines are written for 2026: update them every autumn in both locales, then
 * re-run the seeder with `--write --force`. No courier or same-day cutoff
 * times are written in: those are per zone and shown at checkout.
 *
 * Links /occasions/christmas and /occasions/holiday, both of which held
 * products when written. No product names and no prices.
 */
export const christmasGiftBaskets: GuideSeed = {
  slug: "christmas-gift-baskets-gta",
  category: "SEASONAL",
  readMinutes: 7,
  featured: false,
  title: {
    en: "Christmas gift baskets: who to send to, what to choose and when to order",
    fr: "Paniers-cadeaux de Noël : à qui les offrir, quoi choisir et quand commander",
  },
  excerpt: {
    en: "A practical Christmas gifting plan for the GTA: the people on the long list (hosts, neighbours, teachers, clients), which baskets ship and which stay local, the 2026 delivery calendar, and what to write on the card.",
    fr: "Un plan pratique pour les cadeaux de Noël dans le Grand Toronto : les personnes de la longue liste (hôtes, voisins, enseignants, clients), les paniers expédiables et ceux livrés localement, le calendrier de livraison 2026 et quoi écrire sur la carte.",
  },
  seoTitle: {
    en: "Christmas Gift Baskets in the GTA: What to Send and When to Order",
    fr: "Paniers-cadeaux de Noël dans le Grand Toronto : quoi offrir et quand commander",
  },
  seoDescription: {
    en: "Christmas gift basket ideas for family, hosts, neighbours, teachers and clients, with 2026 delivery dates for Mississauga, the GTA and shipping across Ontario.",
    fr: "Idées de paniers-cadeaux de Noël pour la famille, les hôtes, les voisins, les enseignants et les clients, avec les dates de livraison 2026 pour Mississauga, le Grand Toronto et l'Ontario.",
  },
  body: {
    en: `<p>Christmas gifting is mostly a matter of a long list. Family, of course, but also the friends hosting dinner, the neighbour who took in your parcels all year, the teacher, the clients and the team. Most of the stress in December comes from that list landing all at once.</p>

<p>Here is a calmer way through it. In 2026, Christmas Day falls on a <strong>Friday</strong>, which puts the last full working week before the holiday at Monday 14 to Friday 18 December.</p>

<h2>Write the whole list first</h2>

<p>Before you choose a single gift, write down everyone you intend to send to, with where each gift is going. Then sort the list into three groups:</p>

<ul>
<li><strong>Local.</strong> Addresses in Mississauga and the GTA that our own drivers reach. These can be ordered later and can be anything in the catalogue.</li>
<li><strong>Elsewhere in Ontario or further.</strong> These ship by courier, need more time, and can only include baskets marked as shippable.</li>
<li><strong>Business.</strong> Clients and staff, which usually need to arrive before offices close for the holidays.</li>
</ul>

<p>The sort tells you what to order first. It also saves you from finding out, a week before Christmas, that the basket you wanted for an aunt in Ottawa cannot be shipped.</p>

<h2>Ideas for the people on the list</h2>

<h3>Family</h3>

<p>For the people you will see on the day, a basket is a generous addition to the table: something to open on Christmas Eve, share on the day and pick at through the quiet days that follow. <a href="/category/chocolate">Chocolate</a> and <a href="/category/gourmet">gourmet snack</a> baskets are made for this. For family you will not see, a basket on the doorstep the week before is the next best thing to being there. Browse our <a href="/recipients/family">family gift baskets</a>.</p>

<h3>The hosts</h3>

<p>If someone is cooking Christmas dinner for you, the thank-you gift matters. Don't arrive with something they have to deal with mid-meal. Instead, have a basket delivered a day or two before, or send one in the days after with a thank-you card. A <a href="/category/spa-wellness">spa and wellness</a> basket is a kind choice for the person who did all the cooking.</p>

<h3>Neighbours</h3>

<p>Keep it small and edible, something the household can share. A modest chocolate or <a href="/category/coffee-tea">coffee and tea</a> basket says thank you for the year without making anyone feel they owe you one back.</p>

<h3>Teachers, coaches and caregivers</h3>

<p>The traditional moment is the last school day before the winter break, usually the Friday before Christmas week (your school board's calendar has the exact date). Many Ontario schools are nut-aware or nut-free, so if a food gift is going into the classroom, choose one without nuts or send it to the teacher's home instead. A gift from the whole class, pooled into one larger basket, is often easier on everyone.</p>

<h3>Clients and staff</h3>

<p>Business gifts follow their own rules on timing and tone, and they have specific tax treatment. Our <a href="/guides/corporate-gifting-ontario-cra-rules-budgets-timing">corporate gifting guide</a> covers the CRA rules and budgets, and <a href="/guides/corporate-gift-hampers-how-to-choose">how to choose corporate gift hampers</a> covers what to send. For the office side of December (coworkers, the boss, Secret Santa and the shutdown), see <a href="/guides/christmas-gifts-for-clients-employees-coworkers">Christmas gifts at work</a>. If your list includes people who do not celebrate Christmas, a gift from our <a href="/occasions/holiday">holiday collection</a> with "Happy holidays" on the card includes everyone. For a list of any size, <a href="/corporate/quote">request a corporate quote</a>.</p>

<h2>What travels and what stays local</h2>

<p>Every basket on our site is marked as either shippable or local delivery only, and checkout tells you before you pay if something in your bag cannot reach the address you entered.</p>

<p>As a rule, coffee and tea, packaged gourmet snacks, biscuits, and spa and wellness items ship well. Anything with fresh flowers usually stays local, and so do chocolate-heavy baskets, which do not travel well for days in a courier truck. Winter is easier on chocolate than summer, but a parcel can still sit in a cold truck or a warm depot. When in doubt, choose the shippable version for anywhere outside our local area. The <a href="/guides/ontario-gifting-calendar-thanksgiving-to-holidays">Ontario gifting calendar</a> explains how shipping and local delivery work in more detail.</p>

<h2>When to order for Christmas 2026</h2>

<table>
<thead>
<tr><th>Who it's for</th><th>Aim to order by</th><th>Why</th></tr>
</thead>
<tbody>
<tr><td>Shipped gifts outside our local area</td><td>First week of December</td><td>Courier networks are at their busiest in December and slow down as Christmas gets closer</td></tr>
<tr><td>Clients and staff, delivered to offices</td><td>End of November</td><td>Gifts need to land by Friday 18 December, before many offices close</td></tr>
<tr><td>Teachers</td><td>A week before the last school day</td><td>So the gift arrives at home in time to bring in</td></tr>
<tr><td>Local family, friends and hosts</td><td>Mid-December</td><td>Delivery in the week of 21 December is ideal, and ordering earlier secures your preferred day</td></tr>
<tr><td>Delivery on Thursday 24 December</td><td>Possible locally, not ideal</td><td>Many people are travelling or already out. Plan for the 21st to 23rd if you can</td></tr>
</tbody>
</table>

<p>The exact delivery options for any address appear at checkout once you enter the postal code. Across much of Mississauga and the GTA, <a href="/delivery">same-day and next-day delivery</a> remains a backstop for the gift you forgot, but December is not the month to count on it.</p>

<h2>What to write on the card</h2>

<p>Every Velvéa gift includes a printed message card. At Christmas, warm and simple is enough.</p>

<ul>
<li>"Merry Christmas! Wishing you a cosy holiday and a wonderful new year."</li>
<li>"With love at Christmas, from all of us to all of you."</li>
<li>For hosts: "Thank you for having us this Christmas. We hope you get to put your feet up now."</li>
<li>For a neighbour: "Thank you for being such a great neighbour this year. Merry Christmas!"</li>
<li>For a teacher: "Thank you for everything you have done for [name] this year. Have a lovely, restful break."</li>
<li>For a client: "Wishing you a happy holiday season and a successful new year. Thank you for working with us."</li>
</ul>

<p>For more help with wording, see <a href="/guides/what-to-write-in-a-gift-message">what to write in a gift message</a>.</p>

<p>If you only do one thing early, make it the list. Once you know who is local and who needs a courier, the order dates mostly take care of themselves. Start with our <a href="/occasions/christmas">Christmas gift baskets</a>, or browse <a href="/baskets">all gift baskets</a>.</p>`,

    fr: `<p>Les cadeaux de Noël, c'est surtout une affaire de longue liste. La famille, bien sûr, mais aussi les amis qui reçoivent pour le souper, le voisin qui a pris vos colis toute l'année, l'enseignante, les clients et l'équipe. La plus grande partie du stress de décembre vient de cette liste qui tombe d'un seul coup.</p>

<p>Voici une façon plus calme de s'y prendre. En 2026, Noël tombe un <strong>vendredi</strong>, ce qui fait de la semaine du lundi 14 au vendredi 18 décembre la dernière semaine de travail complète avant les Fêtes.</p>

<h2>Écrivez d'abord toute la liste</h2>

<p>Avant de choisir un seul cadeau, notez toutes les personnes à qui vous comptez offrir quelque chose, avec la destination de chaque cadeau. Puis classez la liste en trois groupes :</p>

<ul>
<li><strong>Local.</strong> Les adresses à Mississauga et dans le Grand Toronto que nos propres livreurs desservent. Elles peuvent être commandées plus tard et inclure n'importe quel article du catalogue.</li>
<li><strong>Ailleurs en Ontario ou plus loin.</strong> Ces cadeaux partent par messager, demandent plus de temps et ne peuvent comprendre que des paniers indiqués comme expédiables.</li>
<li><strong>Entreprise.</strong> Les clients et le personnel, qui doivent généralement recevoir leur cadeau avant la fermeture des bureaux pour les Fêtes.</li>
</ul>

<p>Ce classement vous dit quoi commander en premier. Il vous évite aussi de découvrir, une semaine avant Noël, que le panier choisi pour une tante à Ottawa ne peut pas être expédié.</p>

<h2>Des idées pour les personnes de la liste</h2>

<h3>La famille</h3>

<p>Pour les personnes que vous verrez le jour même, un panier est un ajout généreux à la table : quelque chose à ouvrir la veille de Noël, à partager le jour même et à picorer pendant les journées tranquilles qui suivent. Les paniers de <a href="/fr/category/chocolate">chocolat</a> et de <a href="/fr/category/gourmet">collations gourmandes</a> sont faits pour cela. Pour la famille que vous ne verrez pas, un panier à leur porte la semaine précédente est ce qui ressemble le plus à une visite. Parcourez nos <a href="/fr/recipients/family">paniers-cadeaux pour la famille</a>.</p>

<h3>Les hôtes</h3>

<p>Si quelqu'un prépare le souper de Noël pour vous, le cadeau de remerciement compte. N'arrivez pas avec quelque chose dont il faudra s'occuper en plein repas. Faites plutôt livrer un panier un jour ou deux avant, ou envoyez-en un dans les jours suivants avec une carte de remerciement. Un panier <a href="/fr/category/spa-wellness">spa et bien-être</a> est une attention délicate pour la personne qui a fait toute la cuisine.</p>

<h3>Les voisins</h3>

<p>Restez dans le petit et le gourmand, quelque chose que la maisonnée peut partager. Un panier modeste de chocolat ou de <a href="/fr/category/coffee-tea">café et thé</a> dit merci pour l'année sans donner l'impression qu'on attend quelque chose en retour.</p>

<h3>Enseignants, entraîneurs et gardiennes</h3>

<p>Le moment traditionnel est le dernier jour d'école avant les vacances d'hiver, habituellement le vendredi précédant la semaine de Noël (le calendrier de votre conseil scolaire donne la date exacte). Beaucoup d'écoles ontariennes limitent ou interdisent les noix : si un cadeau gourmand doit entrer en classe, choisissez-en un sans noix ou faites-le livrer au domicile de l'enseignant. Un cadeau de toute la classe, regroupé en un seul panier plus grand, est souvent plus simple pour tout le monde.</p>

<h3>Clients et personnel</h3>

<p>Les cadeaux d'entreprise suivent leurs propres règles de calendrier et de ton, et ils ont un traitement fiscal particulier. Notre <a href="/fr/guides/corporate-gifting-ontario-cra-rules-budgets-timing">guide des cadeaux d'affaires</a> couvre les règles de l'ARC et les budgets, et <a href="/fr/guides/corporate-gift-hampers-how-to-choose">comment choisir des paniers-cadeaux d'entreprise</a> couvre quoi offrir. Pour le volet bureau de décembre (collègues, patron, échange de cadeaux et fermeture des Fêtes), consultez <a href="/fr/guides/christmas-gifts-for-clients-employees-coworkers">les cadeaux de Noël au travail</a>. Si votre liste comprend des personnes qui ne fêtent pas Noël, un cadeau de notre <a href="/fr/occasions/holiday">collection des Fêtes</a> avec « Joyeuses Fêtes » sur la carte inclut tout le monde. Pour une liste de toute taille, <a href="/fr/corporate/quote">demandez une soumission d'entreprise</a>.</p>

<h2>Ce qui voyage et ce qui reste local</h2>

<p>Chaque panier de notre site est indiqué comme expédiable ou en livraison locale seulement, et la page de paiement vous prévient, avant que vous payiez, si un article de votre panier ne peut pas se rendre à l'adresse saisie.</p>

<p>En règle générale, le café et le thé, les collations gourmandes emballées, les biscuits et les articles spa et bien-être s'expédient bien. Tout ce qui contient des fleurs fraîches reste habituellement local, tout comme les paniers riches en chocolat, qui supportent mal plusieurs jours dans un camion de livraison. L'hiver est plus clément pour le chocolat que l'été, mais un colis peut quand même rester dans un camion froid ou un entrepôt chauffé. En cas de doute, choisissez la version expédiable pour toute adresse hors de notre zone locale. Le <a href="/fr/guides/ontario-gifting-calendar-thanksgiving-to-holidays">calendrier des cadeaux en Ontario</a> explique plus en détail le fonctionnement de l'expédition et de la livraison locale.</p>

<h2>Quand commander pour Noël 2026</h2>

<table>
<thead>
<tr><th>Pour qui</th><th>Commandez idéalement avant</th><th>Pourquoi</th></tr>
</thead>
<tbody>
<tr><td>Cadeaux expédiés hors de notre zone locale</td><td>La première semaine de décembre</td><td>Les réseaux de messagerie sont au plus chargé en décembre et ralentissent à l'approche de Noël</td></tr>
<tr><td>Clients et personnel, livrés au bureau</td><td>La fin novembre</td><td>Les cadeaux doivent arriver avant le vendredi 18 décembre, avant la fermeture de nombreux bureaux</td></tr>
<tr><td>Enseignants</td><td>Une semaine avant le dernier jour d'école</td><td>Pour que le cadeau arrive à la maison à temps pour l'apporter</td></tr>
<tr><td>Famille, amis et hôtes locaux</td><td>La mi-décembre</td><td>Une livraison la semaine du 21 décembre est idéale, et commander plus tôt vous garantit le jour voulu</td></tr>
<tr><td>Livraison le jeudi 24 décembre</td><td>Possible localement, pas idéal</td><td>Beaucoup de gens sont en voyage ou déjà sortis. Visez du 21 au 23 si vous le pouvez</td></tr>
</tbody>
</table>

<p>Les options de livraison exactes pour une adresse s'affichent au paiement dès que vous saisissez le code postal. Dans une grande partie de Mississauga et du Grand Toronto, la <a href="/fr/delivery">livraison le jour même ou le lendemain</a> reste une solution de secours pour le cadeau oublié, mais en décembre, mieux vaut ne pas compter dessus.</p>

<h2>Quoi écrire sur la carte</h2>

<p>Chaque cadeau Velvéa comprend une carte-message imprimée. À Noël, un mot simple et chaleureux suffit.</p>

<ul>
<li>« Joyeux Noël! Nous vous souhaitons des Fêtes douillettes et une merveilleuse nouvelle année. »</li>
<li>« Avec tout notre amour à Noël, de nous tous à vous tous. »</li>
<li>Pour les hôtes : « Merci de nous avoir reçus pour Noël. Nous espérons que vous pouvez enfin vous reposer. »</li>
<li>Pour un voisin : « Merci d'avoir été un si bon voisin cette année. Joyeux Noël! »</li>
<li>Pour un enseignant : « Merci pour tout ce que vous avez fait pour [prénom] cette année. Bonnes vacances, reposez-vous bien. »</li>
<li>Pour un client : « Nous vous souhaitons de joyeuses Fêtes et une nouvelle année prospère. Merci de travailler avec nous. »</li>
</ul>

<p>Pour d'autres idées de formulation, consultez <a href="/fr/guides/what-to-write-in-a-gift-message">quoi écrire dans un message de cadeau</a>.</p>

<p>S'il ne faut faire qu'une chose tôt, faites la liste. Une fois que vous savez qui est dans la zone locale et qui a besoin d'un messager, les dates de commande se règlent presque d'elles-mêmes. Commencez par nos <a href="/fr/occasions/christmas">paniers-cadeaux de Noël</a>, ou parcourez <a href="/fr/baskets">tous les paniers-cadeaux</a>.</p>`,
  },
};

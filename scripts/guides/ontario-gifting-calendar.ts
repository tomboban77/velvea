import type { GuideSeed } from "./types";

/**
 * The seasonal guide, and the home for our most differentiated material: why
 * some baskets are local-delivery-only. That distinction is real in the data
 * (`Product.shippable`) and nobody else in this market explains it, because
 * explaining it means admitting a limitation. Being straight about it is worth
 * more than the sale it occasionally costs — a fresh-flower basket that
 * arrives frozen in Thunder Bay is a refund and a bad review, not a customer.
 *
 * Lead times and cutoffs here are deliberately described in relative terms
 * ("before the daily cutoff", "two to three business days") rather than
 * hard-coded: the real numbers live on the delivery zones in the database and
 * are shown at checkout, so a zone edit must not silently make this guide lie.
 */
export const ontarioGiftingCalendar: GuideSeed = {
  slug: "ontario-gifting-calendar-thanksgiving-to-holidays",
  category: "SEASONAL",
  readMinutes: 8,
  featured: true,
  title: {
    en: "The Ontario gifting calendar: Thanksgiving through the holidays",
    fr: "Le calendrier des cadeaux en Ontario : de l'Action de grâce aux Fêtes",
  },
  excerpt: {
    en: "Canadian Thanksgiving falls on Monday, October 12 this year, and the holiday run starts the moment it ends. What makes a good host gift, which baskets can travel by courier and which cannot, and how late you can safely leave it.",
    fr: "L'Action de grâce tombe le lundi 12 octobre cette année, et la saison des Fêtes commence dès qu'elle se termine. Ce qui fait un bon cadeau d'hôte, quels paniers peuvent voyager par messager et lesquels ne le peuvent pas.",
  },
  seoTitle: {
    en: "Ontario Gifting Calendar: Thanksgiving to the Holidays",
    fr: "Calendrier des cadeaux en Ontario : de l'Action de grâce aux Fêtes",
  },
  seoDescription: {
    en: "Canadian Thanksgiving 2026 is Monday, October 12. Host gift etiquette, which gift baskets can be shipped across Ontario and which are local-delivery only, and when to order for December.",
    fr: "L'Action de grâce 2026 est le lundi 12 octobre. Étiquette du cadeau d'hôte, quels paniers peuvent être expédiés en Ontario et lesquels sont réservés à la livraison locale.",
  },
  body: {
    en: `<p>Canadian Thanksgiving falls on <strong>Monday, October 12 this year</strong>, with the long weekend running from Saturday the 10th. From there the calendar barely pauses before the December run begins.</p>

<p>This guide covers both, plus the part of seasonal gifting that nobody writes about honestly: which baskets can actually survive a courier in an Ontario winter, and which ones we will only deliver ourselves.</p>

<h2>Thanksgiving: a host gift, not a present</h2>

<p>The most useful thing to understand about Canadian Thanksgiving is that it is not a gift-exchange holiday. Nobody is owed a present. What circulates is the host gift, and it follows a different logic entirely.</p>

<p><strong>A good host gift does not create work.</strong> That single rule eliminates most of what people bring. Cut flowers that need trimming and a vase arrive at the exact moment the host has no hands free. A dish that needs refrigerating competes for space that was spoken for three days ago. Anything requiring immediate attention is a task wearing the costume of a gift.</p>

<p>What works is something the host can set down and deal with later, or open and share now without a plan:</p>

<ul>
<li><strong>Coffee, tea and breakfast things.</strong> Enjoyed the next morning, when the hosting is over and the leftovers are the only obligation left. A <a href="/category/coffee-tea">coffee or tea basket</a> is one of the best host gifts there is for exactly this reason.</li>
<li><strong>Chocolate and sweets.</strong> They can go straight onto the table, or straight into a cupboard. Either is fine.</li>
<li><strong>An arrangement that arrives finished.</strong> If you want to bring flowers, bring them already arranged, in something that holds them. The problem with flowers as a host gift has never been the flowers.</li>
<li><strong>Savoury and gourmet.</strong> Crackers, preserves, snacks. Useful the same evening, useful the following week.</li>
</ul>

<p>On budget: a host gift is a thank-you, not a statement. Somewhere around $70 to $130 is comfortable for most tables, and spending dramatically more can make a host feel they now owe you something, which is the opposite of the intended effect. Our <a href="/occasions/thanksgiving">Thanksgiving collection</a> sits deliberately across that range.</p>

<h3>If you are not hosting and not attending</h3>

<p>Thanksgiving is also the year's natural moment to reach the people you will not see: parents in another city, a friend who moved, the client whose year you noticed. There is no etiquette to satisfy, which makes it easier, not harder. A basket that arrives on the Friday before the long weekend does more than one that arrives on the Monday, when everyone is already at the table.</p>

<h2>The part nobody explains: what can be shipped</h2>

<p>Every basket on our site is marked as either shippable across Ontario or available for local delivery and pickup only. That is not a sales tactic. It reflects what genuinely survives a courier, and it is worth understanding before you order for somebody outside the GTA.</p>

<h3>Fresh flowers do not travel by courier</h3>

<p>Several of our baskets are built around fresh blooms. Those we deliver ourselves, by hand, within our local zones, and nowhere else. A courier network is designed to move parcels efficiently, not gently: a box can spend a night in an unheated facility, ride in a trailer at whatever temperature the day supplies, and arrive at 6pm on a doorstep in February. Fresh flowers do not come through that looking like the photograph, and we would rather tell you now than refund you later.</p>

<p>If the recipient is outside our local delivery area and you want flowers in the gift, the honest answer is to send a shippable basket and order flowers locally to them instead.</p>

<h3>Chocolate is fine in winter, with one caveat</h3>

<p>Chocolate's reputation as a difficult thing to ship comes from summer. Heat is the enemy: milk chocolate begins to soften well below the temperature a parked delivery van reaches in July. From October through March, Ontario solves that problem for us.</p>

<p>The winter caveat is different and less well known. Chocolate that gets very cold and is then brought quickly into a warm room can develop <strong>bloom</strong>: the pale, chalky film that appears when condensation settles on the surface, dissolves some sugar and leaves crystals behind as it evaporates, or when the cocoa butter separates and rises. It is harmless and it tastes the same, but it does not look like a gift.</p>

<p>The fix is in the recipient's hands and takes no effort: <strong>let the box come up to room temperature before opening it.</strong> An hour is plenty. It is worth a line in your gift message if the parcel is landing somewhere cold.</p>

<h3>What ships well</h3>

<p>Shelf-stable gourmet — chocolate, coffee, tea, biscuits, preserves, savoury snacks — travels reliably across the province, packed in a protective outer box. So do spa and self-care items. If you are sending outside the GTA, these are what to look at: <a href="/category/gourmet">gourmet and snacks</a>, <a href="/category/chocolate">chocolate</a>, <a href="/category/coffee-tea">coffee and tea</a>, and <a href="/category/spa-wellness">spa and wellness</a>.</p>

<p>Anything that cannot be shipped is marked on its product page, and if one is in your bag when you enter an address we would have to ship to, checkout tells you before you pay rather than after.</p>

<h2>How the timing works</h2>

<p>Three different clocks apply depending on where a gift is going, and the exact fees, cutoffs and lead times for any address appear at checkout as soon as you enter the postal code. The postal code, not the city name, decides.</p>

<table>
<thead>
<tr><th>Where it is going</th><th>How it travels</th><th>Realistic timing</th></tr>
</thead>
<tbody>
<tr><td>Mississauga and the core GTA</td><td>We deliver it ourselves</td><td>Same day on orders placed before the daily cutoff, otherwise the next available day</td></tr>
<tr><td>Outer GTA</td><td>We deliver it ourselves</td><td>A day or two, with an earlier same-day cutoff the further out you are</td></tr>
<tr><td>The rest of southern Ontario</td><td>Tracked courier</td><td>Roughly two to three business days</td></tr>
<tr><td>Northern Ontario</td><td>Tracked courier</td><td>Roughly three to five business days</td></tr>
</tbody>
</table>

<p>Two things to keep in mind. Baskets are assembled after you order, so an order placed after the daily cutoff begins its preparation the following day, and that is the first day of the clock, not the delivery. And courier transit times are estimates, not guarantees: once a parcel is with the carrier the final leg belongs to them, and remote parts of the province take longer than the table suggests.</p>

<p>If a gift has to arrive on a particular day, choose local delivery or pickup where you can, and order with room to spare. <a href="/delivery">Our delivery page</a> lists which cities get same-day, next-day or courier service, with the fees for each.</p>

<h2>The December run</h2>

<p>The three weeks before Christmas are the only time of year our calendar meaningfully tightens, and the pressure is capacity, not production. A few dates to keep in mind:</p>

<ul>
<li><strong>Through October.</strong> Everything is available, with no pressure on dates. If you are planning a corporate list, this is when to start.</li>
<li><strong>Early to mid November.</strong> The right moment to book December delivery dates, even if your recipient list is not final.</li>
<li><strong>Late November.</strong> Comfortable for individual orders. For multi-address runs, fix your dates now instead of leaving them open.</li>
<li><strong>December.</strong> Still straightforward for single baskets and local delivery. Anything going by courier to reach the province's edges needs real margin, and the week before Christmas is not the time to discover a basket is local-only.</li>
</ul>

<p>If you are sending at volume, the <a href="/guides/corporate-gifting-ontario-cra-rules-budgets-timing">corporate gifting guide</a> covers budgets, multi-address logistics and the tax treatment.</p>

<h2>A short answer, if you only want one</h2>

<p>For Thanksgiving: something shelf-stable, already finished, in the $70 to $130 range, arriving before the Saturday. For December: order in November if you are sending more than a handful, and check whether what you have chosen can be shipped before you set your heart on it. Start at <a href="/baskets">all gift baskets</a>, or narrow by <a href="/occasions/holiday">the holidays</a>.</p>`,

    fr: `<p>L'Action de grâce tombe le <strong>lundi 12 octobre cette année</strong>, le long week-end commençant le samedi 10. Ensuite, le calendrier marque à peine une pause avant le début de la saison de décembre.</p>

<p>Ce guide couvre les deux, ainsi que l'aspect des cadeaux saisonniers dont personne ne parle franchement : quels paniers survivent réellement à un messager pendant un hiver ontarien, et lesquels nous livrons nous-mêmes exclusivement.</p>

<h2>L'Action de grâce : un cadeau d'hôte, pas un présent</h2>

<p>Ce qu'il faut surtout comprendre de l'Action de grâce au Canada, c'est qu'il ne s'agit pas d'une fête d'échange de cadeaux. Personne ne doit de présent à personne. Ce qui circule, c'est le cadeau d'hôte, et il obéit à une tout autre logique.</p>

<p><strong>Un bon cadeau d'hôte ne crée pas de travail.</strong> Cette seule règle élimine l'essentiel de ce qu'on apporte habituellement. Des fleurs coupées qui exigent d'être taillées et mises en vase arrivent précisément au moment où l'hôte n'a plus une main de libre. Un plat à réfrigérer réclame un espace attribué depuis trois jours. Tout ce qui exige une attention immédiate est une tâche déguisée en cadeau.</p>

<p>Ce qui fonctionne, c'est ce que l'hôte peut déposer et regarder plus tard, ou ouvrir et partager tout de suite sans rien planifier :</p>

<ul>
<li><strong>Café, thé et déjeuner.</strong> Appréciés le lendemain matin, quand la réception est terminée et que les restes sont la seule obligation qui subsiste. Un <a href="/fr/category/coffee-tea">panier de café ou de thé</a> est discrètement l'un des meilleurs cadeaux d'hôte qui soient, exactement pour cette raison.</li>
<li><strong>Chocolat et douceurs.</strong> Ils peuvent aller directement sur la table, ou directement dans l'armoire. L'un ou l'autre convient.</li>
<li><strong>Un arrangement qui arrive terminé.</strong> Si vous voulez apporter des fleurs, apportez-les déjà arrangées, dans un contenant qui les tient. Le problème des fleurs comme cadeau d'hôte n'a jamais été les fleurs.</li>
<li><strong>Salé et gourmand.</strong> Craquelins, confitures, collations. Utiles le soir même, utiles la semaine suivante.</li>
</ul>

<p>Côté budget : un cadeau d'hôte est un remerciement, pas une déclaration. Entre 70 $ et 130 $ convient à la plupart des tables, et dépenser nettement plus peut donner à l'hôte le sentiment de vous devoir quelque chose, soit l'effet exactement inverse de celui recherché. Notre <a href="/fr/occasions/thanksgiving">collection Action de grâce</a> se situe délibérément dans cette fourchette.</p>

<h3>Si vous ne recevez pas et n'êtes pas invité</h3>

<p>L'Action de grâce est aussi le moment naturel de l'année pour joindre les gens que vous ne verrez pas : des parents dans une autre ville, un ami qui a déménagé, le client dont vous avez remarqué l'année. Aucune étiquette à respecter, ce qui rend les choses plus faciles. Un panier qui arrive le vendredi avant le long week-end vaut mieux qu'un panier livré le lundi, quand tout le monde est déjà à table.</p>

<h2>Ce que personne n'explique : ce qui peut être expédié</h2>

<p>Chaque panier de notre site est indiqué comme expédiable partout en Ontario, ou réservé à la livraison locale et à la cueillette. Ce n'est pas une tactique de vente. Cela reflète ce qui survit véritablement à un messager, et il vaut la peine de le comprendre avant de commander pour quelqu'un hors du Grand Toronto.</p>

<h3>Les fleurs fraîches ne voyagent pas par messager</h3>

<p>Plusieurs de nos paniers sont construits autour de fleurs fraîches. Ceux-là, nous les livrons nous-mêmes, à la main, à l'intérieur de nos zones locales, et nulle part ailleurs. Un réseau de messagerie est conçu pour déplacer des colis efficacement, non délicatement : une boîte peut passer une nuit dans une installation non chauffée, voyager dans une remorque à la température qu'offre la journée, et arriver à 18 h sur un perron en février. Les fleurs fraîches n'en ressortent pas comme sur la photographie, et nous préférons vous le dire maintenant plutôt que vous rembourser plus tard.</p>

<p>Si le destinataire est hors de notre zone de livraison locale et que vous tenez aux fleurs, la réponse honnête est d'envoyer un panier expédiable et de commander des fleurs localement chez lui.</p>

<h3>Le chocolat se porte bien en hiver, avec une réserve</h3>

<p>La réputation du chocolat comme marchandise difficile à expédier vient presque entièrement de l'été. La chaleur est l'ennemie : le chocolat au lait commence à ramollir bien en deçà de la température qu'atteint une camionnette stationnée en juillet. D'octobre à mars, l'Ontario règle ce problème pour nous.</p>

<p>La réserve hivernale est différente et moins connue. Un chocolat très froid, rapporté rapidement dans une pièce chaude, peut développer un <strong>blanchiment</strong> : ce voile pâle et crayeux qui apparaît quand la condensation se dépose en surface, dissout un peu de sucre et laisse des cristaux en s'évaporant, ou quand le beurre de cacao se sépare et remonte. C'est inoffensif et le goût est identique, mais cela n'a pas l'air d'un cadeau.</p>

<p>La solution appartient entièrement au destinataire et ne demande aucun effort : <strong>laissez la boîte revenir à température ambiante avant de l'ouvrir.</strong> Une heure suffit amplement. Cela mérite une ligne dans votre message si le colis atterrit dans un endroit froid.</p>

<h3>Ce qui s'expédie bien</h3>

<p>Le gourmand de longue conservation — chocolat, café, thé, biscuits, confitures, collations salées — voyage de façon fiable partout dans la province, emballé dans une boîte extérieure protectrice. Il en va de même des articles de spa et de soins personnels. Si vous envoyez hors du Grand Toronto, voilà où regarder : <a href="/fr/category/gourmet">gourmet et collations</a>, <a href="/fr/category/chocolate">chocolat</a>, <a href="/fr/category/coffee-tea">café et thé</a>, et <a href="/fr/category/spa-wellness">spa et bien-être</a>.</p>

<p>Tout ce qui ne peut être expédié est indiqué sur sa fiche produit, et si un tel article se trouve dans votre panier au moment où vous saisissez une adresse nécessitant une expédition, la caisse vous en avertit avant le paiement, et non après.</p>

<h2>Comment fonctionnent les délais</h2>

<p>Trois horloges différentes s'appliquent selon la destination, et les frais, heures limites et délais exacts pour une adresse donnée apparaissent à la caisse dès que vous saisissez le code postal. C'est le code postal, et non le nom de la ville, qui décide.</p>

<table>
<thead>
<tr><th>Destination</th><th>Mode d'acheminement</th><th>Délai réaliste</th></tr>
</thead>
<tbody>
<tr><td>Mississauga et le cœur du Grand Toronto</td><td>Nous livrons nous-mêmes</td><td>Le jour même avant l'heure limite quotidienne, sinon le jour disponible suivant</td></tr>
<tr><td>Périphérie du Grand Toronto</td><td>Nous livrons nous-mêmes</td><td>Un à deux jours, avec une heure limite plus hâtive à mesure qu'on s'éloigne</td></tr>
<tr><td>Le reste du sud de l'Ontario</td><td>Messager avec suivi</td><td>Environ deux à trois jours ouvrables</td></tr>
<tr><td>Nord de l'Ontario</td><td>Messager avec suivi</td><td>Environ trois à cinq jours ouvrables</td></tr>
</tbody>
</table>

<p>Deux choses à retenir. Les paniers sont assemblés après la commande : une commande passée après l'heure limite quotidienne commence sa préparation le lendemain, et c'est le premier jour du compte, pas la livraison. Et les délais de messagerie sont des estimations, non des garanties : une fois le colis confié au transporteur, le dernier tronçon lui appartient, et les régions éloignées prennent plus de temps que ne le suggère le tableau.</p>

<p>Si un cadeau doit absolument arriver un jour précis, choisissez la livraison locale ou la cueillette lorsque c'est possible, et commandez avec de la marge. <a href="/fr/delivery">Notre page de livraison</a> indique quelles villes obtiennent le jour même, le lendemain ou la messagerie, avec les frais correspondants.</p>

<h2>La saison de décembre</h2>

<p>Les trois semaines précédant Noël sont le seul moment de l'année où notre calendrier se resserre pour de bon, et la contrainte est la capacité, non la production. Quelques repères :</p>

<ul>
<li><strong>Jusqu'à la fin d'octobre.</strong> Toute la gamme, aucune pression sur les dates. Si vous planifiez une liste d'entreprise, c'est le moment de commencer.</li>
<li><strong>Début à mi-novembre.</strong> Le bon moment pour réserver les dates de livraison de décembre, même si votre liste n'est pas définitive.</li>
<li><strong>Fin novembre.</strong> Confortable pour les commandes individuelles. Pour les tournées multi-adresses, fixez vos dates maintenant.</li>
<li><strong>Décembre.</strong> Encore simple pour un panier unique et la livraison locale. Tout ce qui part par messager vers les confins de la province exige une vraie marge, et la semaine avant Noël n'est pas le moment de découvrir qu'un panier est réservé au local.</li>
</ul>

<p>Si vous envoyez en volume, le <a href="/fr/guides/corporate-gifting-ontario-cra-rules-budgets-timing">guide des cadeaux d'affaires</a> couvre les budgets, la logistique multi-adresses et le traitement fiscal.</p>

<h2>Une réponse courte, si vous n'en voulez qu'une</h2>

<p>Pour l'Action de grâce : quelque chose de longue conservation, déjà prêt, entre 70 $ et 130 $, livré avant le samedi. Pour décembre : commandez en novembre si vous envoyez plus de quelques paniers, et vérifiez si ce que vous avez choisi peut être expédié avant de vous y attacher. Commencez par <a href="/fr/baskets">tous les paniers-cadeaux</a>, ou affinez par <a href="/fr/occasions/holiday">les Fêtes</a>.</p>`,
  },
};

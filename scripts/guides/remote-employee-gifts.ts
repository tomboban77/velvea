import type { GuideSeed } from "./types";

/**
 * For the HR lead or founder searching "gifts for remote employees Canada",
 * "holiday gifts for remote teams", "send gifts to employees at home". The
 * pages ranking for it are US gifting platforms and print-on-demand vendors;
 * none deals with Canadian distances, bilingual staff or what a courier can
 * carry in December.
 *
 * It is a logistics guide on purpose. The other corporate guides own the tax
 * rules (corporate-gifting-ontario-cra-rules-budgets-timing), the choice of
 * hamper and the personal touch; this one links to them and does not repeat
 * the CRA figures, so there is one place to correct if they change.
 *
 * Operational facts used, all from the live zones and order limits:
 * courier transit 2-4 business days in southern Ontario up to 5-7 for
 * Newfoundland; non-shippable baskets stay local; online orders go to one
 * address and stop at 10 baskets, a list goes through /corporate/quote;
 * Canada only; no alcohol. If any of those change, change them here.
 *
 * Evergreen: no dated deadlines, it defers to the yearly deadlines guide.
 * No product names and no prices.
 */
export const remoteEmployeeGifts: GuideSeed = {
  slug: "gifts-for-remote-employees-canada",
  category: "CORPORATE",
  readMinutes: 7,
  featured: false,
  title: {
    en: "Gifts for remote employees in Canada: how to send one to every home without the usual problems",
    fr: "Cadeaux pour employés en télétravail au Canada : comment en envoyer un à chaque domicile sans les ennuis habituels",
  },
  excerpt: {
    en: "A working plan for gifting a remote or hybrid team across Canada: collecting home addresses properly, what survives a courier, transit times by province, French cards for Quebec staff, and how to make twenty parcels feel like one shared moment.",
    fr: "Un plan concret pour offrir un cadeau à une équipe à distance ou hybride partout au Canada : recueillir les adresses correctement, ce qui supporte le transport, les délais par province, les cartes en français et l'art de transformer vingt colis en un moment partagé.",
  },
  seoTitle: {
    en: "Gifts for Remote Employees in Canada: A Practical Guide",
    fr: "Cadeaux pour employés en télétravail au Canada",
  },
  seoDescription: {
    en: "How to send holiday and appreciation gifts to remote employees across Canada: collecting addresses, what ships, transit times by province and bilingual cards.",
    fr: "Comment envoyer des cadeaux des Fêtes et de reconnaissance aux employés en télétravail partout au Canada : adresses, expédition, délais par province, cartes bilingues.",
  },
  body: {
    en: `<p>When everyone worked on the same floor, the holiday gift was a morning's work. Boxes arrived at reception and somebody walked them round. With a team spread between Mississauga, Montreal, Calgary and a cottage near Sudbury, the same gesture becomes a small logistics project, and most of the ways it goes wrong have nothing to do with what is in the box.</p>

<p>This is the plan we give companies who ask us to do it. It works for a team of eight or eighty.</p>

<h2>Why it matters more for a remote team</h2>

<p>People in an office get a hundred small signs that they belong: the coffee someone brings back, the cake on a birthday, the manager who stops at the desk. Remote staff get a calendar invite. A parcel on the doorstep is one of the few physical things an employer can put in a remote employee's hands, which is why it lands harder than the same gift would at a desk. It also arrives in front of the family, who have spent the year hearing one side of the video calls.</p>

<h2>Collect addresses the right way</h2>

<p>This is the step that decides everything else, so start here and start early.</p>

<p>Do not pull home addresses out of the HR system and ship to them. People move, they spend December at a parent's house, and some would simply rather their employer did not send things to their home. Ask them. A short form does it, with five questions:</p>

<ul>
<li>The address where you would like to receive a gift, including unit number and buzzer code.</li>
<li>A phone number for the courier.</li>
<li>Any dates you will be away.</li>
<li>Allergies or things you do not eat or use. No explanation needed.</li>
<li>English or French for the card.</li>
</ul>

<p>Say what the address is for and that it will be used once. Make it optional, and offer another route for anyone who prefers one, such as delivery to the nearest office or a co-working space. Set a closing date and send one reminder. Expect about a quarter of the team to need that reminder.</p>

<p>The allergy question is worth more than it looks. Somebody on a team of thirty is coeliac, vegan, pregnant or does not eat pork, and finding out now is the difference between a gift and an apology. We do not put alcohol in any basket, which removes the most common problem before it starts.</p>

<h2>Choose something that travels</h2>

<p>A gift for a remote team has to survive several days in a truck in whatever weather December or July provides. That rules out anything fresh or chilled, and it makes heavy chocolate a risk in summer. On our site every product page says whether a basket can be shipped or is local delivery only, and checkout stops you before payment if something cannot reach an address.</p>

<p>Shelf-stable food, coffee and tea, and spa items all travel well. The <a href="/corporate">corporate gift boxes</a> were built for exactly this, and the <a href="/recipients/employees">gifts for employees</a> page shows the wider range. Send everyone the same gift or gifts of clearly equal standing. Remote teams compare notes in the group chat within the hour, and a visible difference between two colleagues' parcels undoes the gesture. The exception is a dietary swap, which nobody resents.</p>

<h2>How long a parcel takes across Canada</h2>

<p>From our studio in Mississauga, a tracked courier usually takes this long once the parcel has left us:</p>

<table>
<thead>
<tr><th>Going to</th><th>Usual transit</th></tr>
</thead>
<tbody>
<tr><td>The GTA</td><td>Our own drivers, same day or next day</td></tr>
<tr><td>Southern and eastern Ontario</td><td>2 to 4 business days</td></tr>
<tr><td>Northern Ontario, Quebec, the Prairies</td><td>3 to 5 business days</td></tr>
<tr><td>The Maritimes</td><td>3 to 6 business days</td></tr>
<tr><td>British Columbia</td><td>4 to 6 business days</td></tr>
<tr><td>Newfoundland and Labrador</td><td>5 to 7 business days</td></tr>
</tbody>
</table>

<p>Two consequences follow. First, if you want everyone to receive the gift in the same week, the furthest address sets the schedule, so the St. John's parcel leaves first and the Toronto ones last. Tell us the week you are aiming for and we plan the dispatch around the furthest address. Second, add time in December. Couriers slow down from the second week, and a storm anywhere between here and Alberta adds days. For this year's dates, see our <a href="/guides/last-minute-christmas-gifts-gta-delivery-deadlines">Christmas order deadlines</a>. The territories and some remote communities are quoted individually, and we deliver within Canada only, so a colleague working from abroad needs a separate plan.</p>

<h2>Make twenty parcels feel like one moment</h2>

<p>A box that arrives unannounced on a Tuesday is pleasant. A box the whole team opens together is an event, and it costs nothing extra.</p>

<p>The simplest version is a line on the outside card that says "Please keep this closed until Thursday's call." Then give the last ten minutes of the team meeting to opening it. People hold things up to the camera, someone's child wanders into frame, and for a few minutes a distributed team is in the same room. If that is not your team's style, tell people the gift is coming so that it is not left on a porch, and let the card do the talking.</p>

<h2>The card is the personal part</h2>

<p>Every basket we send carries a printed message card, and for a remote employee the card is most of the gift. "Thank you for your hard work this year, from the leadership team" could have been sent to anyone. A line that could only be about this person takes thirty seconds to write: the migration they carried in March, the client they kept, the new hire they trained without being asked.</p>

<p>Ask each manager for one sentence per direct report and put it on the card under the company's message. For staff in Quebec and for francophone colleagues anywhere, the card should be in French, written by someone who speaks it. Our guide to <a href="/guides/corporate-christmas-gifts-that-feel-personal">corporate gifts that feel personal</a> has more on this, with examples.</p>

<h2>Not only in December</h2>

<p>The holidays are the obvious date and the most crowded one. A remote team gives you better ones. A welcome basket that arrives on a new hire's first morning, before the laptop is even set up, does more for a first week than any onboarding deck. A work anniversary, the end of a long project and a return from parental leave are all days when an office would have marked the occasion without thinking, and a remote employee hears nothing.</p>

<p>If the December window has closed, do not force it. A gift scheduled for the first full week of January, with a new-year message, arrives when nothing else does.</p>

<h2>Budget and tax</h2>

<p>Count the delivery as part of the cost per person. Shipping to a home in another province is charged per parcel, so a remote team costs more to gift than the same number of people in one building. Decide the all-in figure per head first and choose the gift to fit it.</p>

<p>On tax, the Canada Revenue Agency treats non-cash gifts to employees differently from cash and gift cards, and there is an annual limit to stay under. We set the rules out, with the figures, in <a href="/guides/corporate-gifting-ontario-cra-rules-budgets-timing">corporate gifting in Ontario: the CRA rules, budgets and timing</a>. If you have employees in Quebec, ask your accountant about the provincial side as well.</p>

<h2>How to order for a list</h2>

<p>The online checkout sends one order to one address and takes up to ten baskets. For a team list, <a href="/corporate/quote">ask for a quote</a> and send us the spreadsheet: names, addresses, phone numbers, card language and each person's line. We confirm what can ship to each address, flag any that look incomplete and handle the routing, and every courier parcel is tracked. Give us as much notice as you can. In December, the list of addresses is what runs late, so start there.</p>

<p>More on how we work with companies is on the <a href="/corporate">corporate gifting page</a>, and <a href="/guides/corporate-gift-hampers-how-to-choose">how to choose a corporate hamper</a> will help with what goes inside.</p>`,

    fr: `<p>Quand tout le monde travaillait au même étage, le cadeau des Fêtes était l'affaire d'une matinée. Les boîtes arrivaient à la réception et quelqu'un faisait la tournée. Avec une équipe répartie entre Mississauga, Montréal, Calgary et un chalet près de Sudbury, le même geste devient un petit projet de logistique, et la plupart des choses qui tournent mal n'ont rien à voir avec le contenu de la boîte.</p>

<p>Voici le plan que nous donnons aux entreprises qui nous confient cette tâche. Il vaut pour une équipe de huit comme de quatre-vingts.</p>

<h2>Pourquoi cela compte davantage pour une équipe à distance</h2>

<p>Au bureau, on reçoit cent petits signes d'appartenance : le café qu'un collègue rapporte, le gâteau d'anniversaire, la gestionnaire qui s'arrête au poste de travail. Le personnel à distance reçoit une invitation de calendrier. Un colis sur le pas de la porte est l'une des rares choses concrètes qu'un employeur peut mettre entre les mains d'un employé en télétravail, et c'est pourquoi il touche plus que le même cadeau déposé sur un bureau. Il arrive aussi devant la famille, qui a passé l'année à entendre la moitié des appels vidéo.</p>

<h2>Recueillez les adresses de la bonne façon</h2>

<p>C'est l'étape qui décide de tout le reste : commencez par là, et commencez tôt.</p>

<p>Ne tirez pas les adresses personnelles du système des RH pour y expédier des colis. Les gens déménagent, passent décembre chez un parent, et certains préfèrent simplement que leur employeur n'envoie rien chez eux. Demandez-leur. Un court formulaire suffit, avec cinq questions :</p>

<ul>
<li>L'adresse où vous souhaitez recevoir un cadeau, avec le numéro d'appartement et le code d'interphone.</li>
<li>Un numéro de téléphone pour le messager.</li>
<li>Les dates où vous serez absent.</li>
<li>Vos allergies, ou ce que vous ne mangez pas ou n'utilisez pas. Aucune explication requise.</li>
<li>Carte en français ou en anglais.</li>
</ul>

<p>Dites à quoi servira l'adresse et précisez qu'elle ne sera utilisée qu'une fois. Rendez la réponse facultative et proposez une autre voie à ceux qui la préfèrent, comme une livraison au bureau le plus proche ou dans un espace de travail partagé. Fixez une date de clôture et envoyez un seul rappel. Attendez-vous à ce qu'environ le quart de l'équipe en ait besoin.</p>

<p>La question sur les allergies vaut plus qu'il n'y paraît. Dans une équipe de trente, quelqu'un est cœliaque, végane, enceinte ou ne mange pas de porc, et l'apprendre maintenant fait la différence entre un cadeau et des excuses. Nous ne mettons d'alcool dans aucun panier, ce qui élimine d'emblée le problème le plus fréquent.</p>

<h2>Choisissez quelque chose qui voyage</h2>

<p>Un cadeau destiné à une équipe à distance doit supporter plusieurs jours dans un camion, par le temps que décembre ou juillet voudra bien offrir. Cela exclut tout ce qui est frais ou réfrigéré, et rend le chocolat en grande quantité risqué en été. Sur notre site, chaque fiche produit indique si le panier peut être expédié ou s'il est réservé à la livraison locale, et la caisse vous arrête avant le paiement si un article ne peut pas se rendre à une adresse.</p>

<p>Les aliments de longue conservation, le café, le thé et les articles de spa voyagent bien. Les <a href="/fr/corporate">coffrets-cadeaux d'entreprise</a> ont été conçus pour cela, et la page des <a href="/fr/recipients/employees">cadeaux pour employés</a> montre un choix plus large. Envoyez à tous le même cadeau, ou des cadeaux de valeur visiblement égale. Les équipes à distance comparent leurs colis dans le clavardage de groupe dans l'heure qui suit, et une différence visible entre deux collègues annule le geste. L'exception est une substitution pour raison alimentaire, que personne ne reproche.</p>

<h2>Combien de temps met un colis à traverser le Canada</h2>

<p>Depuis notre atelier de Mississauga, un messager avec suivi met habituellement ce temps une fois le colis parti :</p>

<table>
<thead>
<tr><th>Destination</th><th>Délai habituel</th></tr>
</thead>
<tbody>
<tr><td>Le Grand Toronto</td><td>Nos propres livreurs, le jour même ou le lendemain</td></tr>
<tr><td>Sud et est de l'Ontario</td><td>2 à 4 jours ouvrables</td></tr>
<tr><td>Nord de l'Ontario, Québec, Prairies</td><td>3 à 5 jours ouvrables</td></tr>
<tr><td>Les Maritimes</td><td>3 à 6 jours ouvrables</td></tr>
<tr><td>Colombie-Britannique</td><td>4 à 6 jours ouvrables</td></tr>
<tr><td>Terre-Neuve-et-Labrador</td><td>5 à 7 jours ouvrables</td></tr>
</tbody>
</table>

<p>Deux conséquences en découlent. D'abord, si vous voulez que tout le monde reçoive son cadeau la même semaine, c'est l'adresse la plus éloignée qui fixe le calendrier : le colis de St. John's part le premier et ceux de Toronto en dernier. Dites-nous la semaine visée et nous planifions les envois à partir de l'adresse la plus éloignée. Ensuite, prévoyez du temps en plus en décembre. Les messagers ralentissent dès la deuxième semaine, et une tempête n'importe où entre ici et l'Alberta ajoute des jours. Pour les dates de cette année, consultez nos <a href="/fr/guides/last-minute-christmas-gifts-gta-delivery-deadlines">dates limites de commande pour Noël</a>. Les territoires et certaines communautés éloignées font l'objet d'un prix sur demande, et nous livrons au Canada seulement : un collègue qui travaille de l'étranger demande un plan à part.</p>

<h2>Faites de vingt colis un seul moment</h2>

<p>Une boîte qui arrive sans prévenir un mardi fait plaisir. Une boîte que toute l'équipe ouvre ensemble devient un événement, sans coûter un sou de plus.</p>

<p>La version la plus simple tient en une ligne sur la carte extérieure : « Merci de ne pas ouvrir avant l'appel de jeudi. » Consacrez ensuite les dix dernières minutes de la réunion d'équipe à l'ouverture. Les gens montrent leurs trouvailles à la caméra, l'enfant de quelqu'un entre dans le cadre, et pendant quelques minutes une équipe dispersée se retrouve dans la même pièce. Si ce n'est pas le style de votre équipe, prévenez au moins les gens qu'un cadeau s'en vient pour qu'il ne reste pas sur un perron, et laissez la carte parler.</p>

<h2>La carte, c'est la partie personnelle</h2>

<p>Chaque panier que nous envoyons porte une carte-message imprimée, et pour un employé à distance, la carte fait l'essentiel du cadeau. « Merci pour votre excellent travail cette année, de la part de la direction » aurait pu être envoyé à n'importe qui. Une ligne qui ne peut concerner que cette personne s'écrit en trente secondes : la migration qu'elle a portée en mars, le client qu'elle a gardé, la recrue qu'elle a formée sans qu'on le lui demande.</p>

<p>Demandez à chaque gestionnaire une phrase par membre de son équipe et placez-la sur la carte, sous le message de l'entreprise. Pour le personnel du Québec et les collègues francophones où qu'ils soient, la carte doit être en français, écrite par quelqu'un qui le parle. Notre guide sur les <a href="/fr/guides/corporate-christmas-gifts-that-feel-personal">cadeaux d'entreprise qui restent personnels</a> en dit plus, exemples à l'appui.</p>

<h2>Pas seulement en décembre</h2>

<p>Les Fêtes sont la date évidente, et la plus encombrée. Une équipe à distance vous en offre de meilleures. Un panier de bienvenue qui arrive le premier matin d'une nouvelle recrue, avant même que le portable soit configuré, fait plus pour une première semaine que n'importe quelle présentation d'accueil. Un anniversaire d'embauche, la fin d'un long projet, un retour de congé parental : autant de jours qu'un bureau aurait soulignés sans y penser, et où un employé à distance n'entend rien.</p>

<p>Si la fenêtre de décembre est fermée, ne forcez pas. Un cadeau prévu pour la première semaine complète de janvier, avec un message de nouvelle année, arrive quand rien d'autre n'arrive.</p>

<h2>Budget et fiscalité</h2>

<p>Comptez la livraison dans le coût par personne. L'expédition vers un domicile dans une autre province est facturée par colis : une équipe à distance coûte donc plus cher à gâter que le même nombre de personnes dans un seul immeuble. Fixez d'abord le montant tout compris par personne, puis choisissez le cadeau en conséquence.</p>

<p>Côté fiscal, l'Agence du revenu du Canada ne traite pas les cadeaux non monétaires aux employés comme l'argent et les cartes-cadeaux, et il y a un plafond annuel à respecter. Nous exposons les règles, chiffres à l'appui, dans <a href="/fr/guides/corporate-gifting-ontario-cra-rules-budgets-timing">les cadeaux d'entreprise en Ontario : règles de l'ARC, budgets et calendrier</a>. Si vous avez des employés au Québec, interrogez aussi votre comptable sur le volet provincial.</p>

<h2>Comment commander pour une liste</h2>

<p>La caisse en ligne envoie une commande à une seule adresse et accepte jusqu'à dix paniers. Pour une liste d'équipe, <a href="/fr/corporate/quote">demandez une soumission</a> et envoyez-nous le tableur : noms, adresses, numéros de téléphone, langue de la carte et la ligne de chaque personne. Nous confirmons ce qui peut être expédié à chaque adresse, signalons celles qui semblent incomplètes et nous occupons de l'acheminement, et chaque colis confié au messager est suivi. Donnez-nous le plus de préavis possible. En décembre, c'est la liste d'adresses qui prend du retard : commencez par là.</p>

<p>Pour en savoir plus sur notre travail avec les entreprises, voyez la <a href="/fr/corporate">page des cadeaux d'entreprise</a>, et <a href="/fr/guides/corporate-gift-hampers-how-to-choose">comment choisir un panier d'entreprise</a> vous aidera pour le contenu.</p>`,
  },
};

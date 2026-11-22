import type { GuideSeed } from "./types";

/**
 * The "holiday tipping guide Canada" search: who to tip in December, how much,
 * and when a gift is the better choice. The results for it are mostly American
 * (doormen, USPS rules) or Canadian pieces several years old, which is the gap.
 *
 * The ranges are the ones Canadian sources agree on, not our invention:
 * Global News (C. McBeth), TD Stories (L. Orr, Toronto, 2019), NerdWallet
 * Canada (Emily Post figures, 2023) and Chatelaine. Where they disagree the
 * table gives the overlap. They are conventions, so the copy calls them that.
 *
 * Rules we state, and how sure we are:
 *  - Canada Post: its code of conduct allows gifts of nominal value (reported
 *    by Global News; we could not read the code itself). Stated softly.
 *  - Nurses: College of Nurses of Ontario guidance, read directly. Detail is in
 *    the hospital-staff guide, which this one links to.
 *  - Waste crews, home-care agencies: no rule we could verify, so the copy says
 *    "ask" and never claims a ban.
 *
 * No product names and no prices of ours. The amounts are tips, not our prices.
 */
export const holidayTipping: GuideSeed = {
  slug: "holiday-tipping-guide-canada-who-to-tip-how-much",
  category: "ETIQUETTE",
  readMinutes: 7,
  featured: false,
  title: {
    en: "Holiday tipping in Canada: who to tip, how much, and when a gift is better than cash",
    fr: "Pourboires des Fêtes au Canada : qui remercier, combien donner et quand un cadeau vaut mieux que de l'argent",
  },
  excerpt: {
    en: "The usual Canadian holiday tip for a cleaner, hairdresser, nanny, daycare educator, condo concierge, letter carrier and more, in one table, with the cases where cash is wrong and a gift or a shared basket is the better thank-you.",
    fr: "Le pourboire des Fêtes habituel au Canada pour la femme de ménage, la coiffeuse, la nounou, l'éducatrice, le concierge, le facteur et d'autres, en un seul tableau, avec les cas où l'argent ne convient pas et où un cadeau ou un panier à partager est un meilleur merci.",
  },
  seoTitle: {
    en: "Holiday Tipping Guide for Canada: Who to Tip and How Much",
    fr: "Pourboires des Fêtes au Canada : qui et combien",
  },
  seoDescription: {
    en: "A Canadian holiday tipping guide: what to give a cleaner, hairdresser, nanny, daycare staff, concierge and letter carrier, and when to give a gift, not cash.",
    fr: "Guide canadien des pourboires des Fêtes : quoi donner à la femme de ménage, à la coiffeuse, à la nounou, à la garderie, au concierge et au facteur.",
  },
  body: {
    en: `<p>December is when you notice how many people keep your year running. The person who cleans the house every second Friday. The concierge who has signed for forty parcels. The hairdresser who squeezed you in before the wedding. There is a long-standing custom of thanking them at the end of the year, and no one ever hands you the rules.</p>

<p>These are the conventions most Canadian etiquette advisers agree on. They are customs, so treat the numbers as a guide and your own budget as the limit.</p>

<h2>The rule underneath all the numbers</h2>

<p>For someone you pay regularly, the holiday tip is roughly the cost of one visit. One cleaning, one haircut, one training session, one week of dog walks. For someone who works in your home for many hours a week, such as a nanny, it rises to about a week's pay. For people you do not pay directly, like a letter carrier or a teacher, it is a small gift of $10 to $25.</p>

<h2>Who gets what</h2>

<table>
<thead>
<tr><th>Who</th><th>The usual amount</th><th>Cash or gift</th></tr>
</thead>
<tbody>
<tr><td>House cleaner (regular)</td><td>The cost of one visit</td><td>Cash, in a card</td></tr>
<tr><td>Nanny</td><td>Up to one week's pay, plus something from the children</td><td>Cash, in a card</td></tr>
<tr><td>Regular babysitter</td><td>One evening's pay</td><td>Cash or a gift card</td></tr>
<tr><td>Daycare educators</td><td>$25 to $50 each, or a shared gift for the room</td><td>Gift card or shared gift</td></tr>
<tr><td>Teacher</td><td>About $20 to $25, or a class gift</td><td>Gift, never cash</td></tr>
<tr><td>Hairdresser, barber, aesthetician</td><td>The cost of one visit, or double your usual tip</td><td>Cash</td></tr>
<tr><td>Personal trainer, music teacher, tutor, coach</td><td>The cost of one session</td><td>Cash or a gift</td></tr>
<tr><td>Dog walker, pet sitter</td><td>One visit, up to one week's pay if they come daily</td><td>Cash</td></tr>
<tr><td>Condo concierge and security</td><td>$20 to $50 each, or a contribution to the building's staff fund</td><td>Cash, gift card or a shared gift for the desk</td></tr>
<tr><td>Building superintendent</td><td>$20 to $80, depending on how often you call</td><td>Cash or a gift</td></tr>
<tr><td>Letter carrier</td><td>A small gift worth $10 to $20</td><td>Gift or coffee card</td></tr>
<tr><td>Newspaper carrier</td><td>$10 to $30</td><td>Cash in a card</td></tr>
<tr><td>Garbage and recycling crew</td><td>$10 to $20 each, if you know them</td><td>Gift or coffee card</td></tr>
<tr><td>Snow removal, lawn care</td><td>$20 to $50 a person</td><td>Cash</td></tr>
<tr><td>School bus driver</td><td>$10 to $20</td><td>Coffee card</td></tr>
</tbody>
</table>

<p>Nobody tips all fifteen. Most households have four or five of these people in their lives, and the list is there so you can find yours.</p>

<h2>When cash is the wrong answer</h2>

<p>Cash is the best gift for anyone who works for themselves or lives on tips. For people employed by an institution it can be a problem, because many employers limit what staff may accept.</p>

<p>Letter carriers are the well-known case. Canada Post's code of conduct has long allowed employees to accept gifts of nominal value, which is why the convention is a card and a coffee card, not a fifty-dollar bill. Teachers are similar: school boards set their own rules, and a note with a small gift or a class collection is the safe form. We cover that in our guide to <a href="/guides/teacher-christmas-gifts-how-much-to-spend-class-gift">Christmas gifts for teachers</a>.</p>

<p>Health care is stricter. The College of Nurses of Ontario tells nurses that they should generally avoid accepting gifts from the people they care for, and to follow their employer's policy when one is offered. The same goes for personal support workers sent by a home-care agency and for staff in a long-term care home: ask the agency or the home what is allowed before you put anyone in the position of refusing. In nearly every case a card, and something the whole team can share, is welcome. There is more in our guide to <a href="/guides/thank-you-gifts-for-nurses-doctors-hospital-staff">thank-you gifts for nurses, doctors and hospital staff</a>.</p>

<p>For municipal or contract crews such as waste collection, a sealed box of chocolates or a few coffee cards handed over in person is a safer choice than an envelope taped to the bin.</p>

<h2>The people you do not tip</h2>

<p>Holiday tipping is for personal services. Professionals who bill you (your doctor, dentist, lawyer, accountant, financial adviser, real estate agent) are not tipped, in December or at any other time. If one of them went well beyond the job this year, a card says it. If you want to do more, send something to the office that the whole staff can share, because the receptionist who found you an appointment did as much as anyone.</p>

<p>You also do not tip upward. A boss does not get a cash gift from an employee. If the team wants to do something, a card signed by everyone and one modest shared gift is the limit. Our guide to <a href="/guides/christmas-gifts-for-clients-employees-coworkers">Christmas gifts at work</a> covers the office in detail.</p>

<h2>One gift for a whole team</h2>

<p>Some of the people on your list come as a group. Six staff rotate through the concierge desk. The salon has an assistant who washes your hair and a receptionist who moves your appointments. The daycare room has three educators and a float. The vet clinic, the physiotherapy office, the pharmacy counter.</p>

<p>Tipping one person in a group and missing the rest is the mistake to avoid. A single gift addressed to the team solves it, and food is the classic choice because it divides itself. A <a href="/category/gourmet">gourmet or snack basket</a>, <a href="/category/chocolate">chocolate</a>, or <a href="/category/coffee-tea">coffee and tea</a> for the break room all work, and our <a href="/occasions/thank-you">thank-you collection</a> gathers the ones suited to it. Look for individually wrapped items when the team works shifts, so the night staff find something left. Address the card to the team by name ("To everyone at the front desk at 4070 Confederation") and say what you are thanking them for.</p>

<p>In a condo, check first whether the board runs a holiday fund for the staff. Many GTA buildings do, a notice goes up in the elevator in late November, and the money is split among everyone including the cleaners you never see. Give to the fund, then add a card for the person you deal with most.</p>

<h2>When to give it</h2>

<p>The first two weeks of December are the right time. It arrives before people's own holiday spending, and you avoid the last week, when shifts change and regulars are away. Hand it over yourself where you can. For a cleaner or a dog walker who comes while you are out, leave the card where they will see it with their name on the envelope.</p>

<p>If you are sending a basket to a team, think about who will be there to receive it. Our weekday deliveries in the GTA go out in the evening, which suits a concierge desk that is staffed around the clock. For a salon, a clinic or an office that closes at five, have it delivered to your own door the evening before and carry it in, or collect it from our Mississauga studio. Orders placed before noon can be delivered the same day across most of the GTA, and the December dates are in our <a href="/guides/last-minute-christmas-gifts-gta-delivery-deadlines">Christmas deadlines guide</a>.</p>

<h2>If money is tight this year</h2>

<p>Then give less, or give a card. The custom is a thank-you and not a bill, and everyone on this list would choose a few written lines over a tip that put you in debt. Put the people who depend on tips first: the cleaner, the hairdresser, the sitter. For the rest, write the note. "You made this year easier for us, and we noticed" is worth having, and it is often what people keep.</p>

<p>For wording, see <a href="/guides/what-to-write-in-a-gift-message">what to write in a gift message</a>.</p>`,

    fr: `<p>C'est en décembre qu'on remarque combien de personnes font rouler notre année. Celle qui fait le ménage un vendredi sur deux. Le concierge qui a signé pour quarante colis. La coiffeuse qui vous a trouvé une place avant le mariage. Il existe une vieille coutume qui veut qu'on les remercie en fin d'année, et personne ne vous en remet jamais les règles.</p>

<p>Voici les usages sur lesquels s'entendent la plupart des conseillers en étiquette au Canada. Ce sont des coutumes : prenez les chiffres comme un repère et votre budget comme limite.</p>

<h2>La règle derrière tous les chiffres</h2>

<p>Pour une personne que vous payez régulièrement, le pourboire des Fêtes équivaut à peu près au prix d'une visite. Un ménage, une coupe de cheveux, une séance d'entraînement, une semaine de promenades du chien. Pour quelqu'un qui travaille chez vous de nombreuses heures par semaine, comme une nounou, il monte à environ une semaine de salaire. Pour les gens que vous ne payez pas directement, comme le facteur ou l'enseignante, c'est un petit cadeau de 10 $ à 25 $.</p>

<h2>Qui reçoit quoi</h2>

<table>
<thead>
<tr><th>Qui</th><th>Le montant habituel</th><th>Argent ou cadeau</th></tr>
</thead>
<tbody>
<tr><td>Femme ou homme de ménage (régulier)</td><td>Le prix d'une visite</td><td>Argent, dans une carte</td></tr>
<tr><td>Nounou</td><td>Jusqu'à une semaine de salaire, plus un petit quelque chose des enfants</td><td>Argent, dans une carte</td></tr>
<tr><td>Gardienne régulière</td><td>Le prix d'une soirée</td><td>Argent ou carte-cadeau</td></tr>
<tr><td>Éducatrices en garderie</td><td>De 25 $ à 50 $ chacune, ou un cadeau commun pour le local</td><td>Carte-cadeau ou cadeau commun</td></tr>
<tr><td>Enseignant</td><td>Environ 20 $ à 25 $, ou un cadeau de classe</td><td>Cadeau, jamais d'argent</td></tr>
<tr><td>Coiffeuse, barbier, esthéticienne</td><td>Le prix d'une visite, ou le double du pourboire habituel</td><td>Argent</td></tr>
<tr><td>Entraîneur, professeur de musique, tuteur</td><td>Le prix d'une séance</td><td>Argent ou cadeau</td></tr>
<tr><td>Promeneur de chiens, gardien d'animaux</td><td>Une visite, jusqu'à une semaine s'il vient tous les jours</td><td>Argent</td></tr>
<tr><td>Concierge et sécurité de la tour</td><td>De 20 $ à 50 $ chacun, ou une contribution au fonds du personnel</td><td>Argent, carte-cadeau ou cadeau commun pour l'accueil</td></tr>
<tr><td>Surintendant d'immeuble</td><td>De 20 $ à 80 $, selon la fréquence de vos appels</td><td>Argent ou cadeau</td></tr>
<tr><td>Facteur</td><td>Un petit cadeau de 10 $ à 20 $</td><td>Cadeau ou carte-café</td></tr>
<tr><td>Camelot</td><td>De 10 $ à 30 $</td><td>Argent, dans une carte</td></tr>
<tr><td>Éboueurs et équipe du recyclage</td><td>De 10 $ à 20 $ chacun, si vous les connaissez</td><td>Cadeau ou carte-café</td></tr>
<tr><td>Déneigement, entretien de la pelouse</td><td>De 20 $ à 50 $ par personne</td><td>Argent</td></tr>
<tr><td>Chauffeur d'autobus scolaire</td><td>De 10 $ à 20 $</td><td>Carte-café</td></tr>
</tbody>
</table>

<p>Personne ne remercie les quinze. La plupart des foyers comptent quatre ou cinq de ces personnes dans leur quotidien, et la liste sert à trouver les vôtres.</p>

<h2>Quand l'argent n'est pas la bonne réponse</h2>

<p>L'argent est le meilleur cadeau pour quiconque travaille à son compte ou vit de pourboires. Pour les employés d'une institution, il peut poser problème, car bien des employeurs limitent ce que le personnel peut accepter.</p>

<p>Les facteurs sont le cas le plus connu. Le code de conduite de Postes Canada permet depuis longtemps aux employés d'accepter des cadeaux de valeur symbolique : voilà pourquoi l'usage est une carte et une carte-café, pas un billet de cinquante dollars. Pour les enseignants, c'est semblable : les conseils scolaires fixent leurs propres règles, et un mot accompagné d'un petit cadeau ou d'une collecte de classe est la forme sûre. Nous en parlons dans notre guide des <a href="/fr/guides/teacher-christmas-gifts-how-much-to-spend-class-gift">cadeaux de Noël pour les enseignants</a>.</p>

<p>Le milieu de la santé est plus strict. L'Ordre des infirmières et infirmiers de l'Ontario indique à ses membres qu'ils devraient en général éviter d'accepter des cadeaux des personnes qu'ils soignent, et suivre la politique de leur employeur quand on leur en offre un. Il en va de même pour les préposées envoyées par une agence de soins à domicile et pour le personnel d'un foyer de soins de longue durée : demandez à l'agence ou au foyer ce qui est permis avant de placer quelqu'un dans l'obligation de refuser. Dans presque tous les cas, une carte et quelque chose que toute l'équipe peut partager sont bienvenus. Pour en savoir plus, lisez notre guide des <a href="/fr/guides/thank-you-gifts-for-nurses-doctors-hospital-staff">cadeaux de remerciement pour le personnel soignant</a>.</p>

<p>Pour les équipes municipales ou sous contrat, comme la collecte des déchets, une boîte de chocolats scellée ou quelques cartes-café remises en mains propres sont un choix plus sûr qu'une enveloppe collée sur le bac.</p>

<h2>Ceux à qui on ne donne pas de pourboire</h2>

<p>Les pourboires des Fêtes concernent les services personnels. Les professionnels qui vous envoient une facture (médecin, dentiste, avocat, comptable, conseiller financier, courtier immobilier) n'en reçoivent pas, ni en décembre ni à un autre moment. Si l'un d'eux en a fait bien plus que demandé cette année, une carte le dit. Si vous voulez faire davantage, envoyez au bureau quelque chose que tout le personnel peut partager, car la réceptionniste qui vous a trouvé un rendez-vous a fait autant que les autres.</p>

<p>On ne donne pas non plus vers le haut. Un patron ne reçoit pas d'argent d'un employé. Si l'équipe veut faire un geste, une carte signée par tous et un cadeau commun modeste sont la limite. Notre guide des <a href="/fr/guides/christmas-gifts-for-clients-employees-coworkers">cadeaux de Noël au travail</a> traite du bureau en détail.</p>

<h2>Un seul cadeau pour toute une équipe</h2>

<p>Certaines personnes de votre liste viennent en groupe. Six employés se relaient à l'accueil de la tour. Au salon, une assistante vous lave les cheveux et une réceptionniste déplace vos rendez-vous. Le local de la garderie compte trois éducatrices et une remplaçante. La clinique vétérinaire, le bureau de physiothérapie, le comptoir de la pharmacie.</p>

<p>Remercier une personne du groupe et oublier les autres est l'erreur à éviter. Un seul cadeau adressé à l'équipe règle la question, et la nourriture est le choix classique parce qu'elle se partage toute seule. Un <a href="/fr/category/gourmet">panier gourmand ou de collations</a>, du <a href="/fr/category/chocolate">chocolat</a> ou du <a href="/fr/category/coffee-tea">café et du thé</a> pour la salle de pause conviennent tous, et notre <a href="/fr/occasions/thank-you">collection de remerciement</a> regroupe ceux qui s'y prêtent. Privilégiez les articles emballés individuellement quand l'équipe travaille par quarts, pour qu'il en reste à ceux de nuit. Adressez la carte à l'équipe par son nom (« À toute l'équipe de l'accueil du 4070 Confederation ») et dites pourquoi vous la remerciez.</p>

<p>En copropriété, vérifiez d'abord si le conseil d'administration tient un fonds des Fêtes pour le personnel. Beaucoup d'immeubles du Grand Toronto le font : un avis apparaît dans l'ascenseur à la fin de novembre, et la somme est répartie entre tous, y compris le personnel d'entretien que vous ne croisez jamais. Contribuez au fonds, puis ajoutez une carte pour la personne à qui vous avez le plus souvent affaire.</p>

<h2>Quand le remettre</h2>

<p>Les deux premières semaines de décembre sont le bon moment. Le geste arrive avant les dépenses des Fêtes de chacun, et vous évitez la dernière semaine, où les quarts changent et les habitués sont absents. Remettez-le vous-même quand c'est possible. Pour une femme de ménage ou un promeneur de chiens qui passe en votre absence, laissez la carte bien en vue, avec son nom sur l'enveloppe.</p>

<p>Si vous envoyez un panier à une équipe, pensez à qui sera là pour le recevoir. Nos livraisons de semaine dans le Grand Toronto se font en soirée, ce qui convient à un accueil de tour ouvert jour et nuit. Pour un salon, une clinique ou un bureau qui ferme à 17 h, faites-le livrer chez vous la veille au soir et apportez-le, ou passez le prendre à notre atelier de Mississauga. Les commandes passées avant midi peuvent être livrées le jour même dans la majeure partie du Grand Toronto, et les dates de décembre se trouvent dans notre <a href="/fr/guides/last-minute-christmas-gifts-gta-delivery-deadlines">guide des dates limites de Noël</a>.</p>

<h2>Si le budget est serré cette année</h2>

<p>Alors donnez moins, ou donnez une carte. La coutume est un merci, pas une facture, et toutes les personnes de cette liste préféreraient quelques lignes écrites à un pourboire qui vous endette. Faites passer en premier ceux qui dépendent des pourboires : la femme de ménage, la coiffeuse, la gardienne. Pour les autres, écrivez le mot. « Vous nous avez facilité l'année, et nous l'avons remarqué » fait plaisir à recevoir, et c'est souvent ce que les gens gardent.</p>

<p>Pour la formulation, voyez <a href="/fr/guides/what-to-write-in-a-gift-message">quoi écrire dans un message de cadeau</a>.</p>`,
  },
};

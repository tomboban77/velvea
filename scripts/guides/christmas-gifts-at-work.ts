import type { GuideSeed } from "./types";

/**
 * The workplace Christmas page. The general Christmas guide hands its
 * corporate section off, and the two corporate guides are year-round (tax and
 * budgets in one, choosing the hamper in the other), so nothing answered the
 * December searches: gifts for clients and staff before the office shuts,
 * coworkers, the boss, Secret Santa. This one does, and links out for tax and
 * hamper selection instead of repeating them.
 *
 * Calendar lines are written for 2026 (Christmas and New Year's Day both on a
 * Friday, offices back Monday 4 January 2027). Update them every autumn in both
 * locales with the other Christmas guide, then re-run the seeder with
 * `--write --force`. Boxing Day observance is deliberately not stated: it falls
 * on a Saturday and employers handle the substitute day differently.
 *
 * Service claims (branded cards, per-recipient messages, delivery to every
 * address across Ontario, one invoice, one-business-day quote reply, the
 * ready-to-send boxes on /corporate) match messages/*.json and the corporate
 * gifting guide. No product names and no prices.
 */
export const christmasGiftsAtWork: GuideSeed = {
  slug: "christmas-gifts-for-clients-employees-coworkers",
  category: "CORPORATE",
  readMinutes: 8,
  featured: false,
  title: {
    en: "Christmas gifts at work: clients, your team, coworkers and the boss",
    fr: "Les cadeaux de Noël au travail : clients, équipe, collègues et patron",
  },
  excerpt: {
    en: "Work Christmas comes with two lists: the company's and your own. Who belongs on each, the 2026 timeline that beats the office shutdown, client gift policies, Secret Santa, gifting the boss, and what to write on the card.",
    fr: "Noël au bureau vient avec deux listes : celle de l'entreprise et la vôtre. Qui figure sur chacune, le calendrier 2026 pour devancer la fermeture des bureaux, les politiques de cadeaux des clients, l'échange de cadeaux, le cadeau au patron et quoi écrire sur la carte.",
  },
  seoTitle: {
    en: "Christmas Gifts for Clients, Employees and Coworkers (2026)",
    fr: "Cadeaux de Noël pour clients, employés et collègues (2026)",
  },
  seoDescription: {
    en: "How to handle Christmas gifting at work in the GTA: who to send to, a 2026 timeline that beats the office shutdown, client gift policies, Secret Santa, gifts for the boss and card wording.",
    fr: "Bien gérer les cadeaux de Noël au travail dans le Grand Toronto : à qui offrir, un calendrier 2026 avant la fermeture des bureaux, les politiques de cadeaux, l'échange de cadeaux, le patron et la carte.",
  },
  body: {
    en: `<p>Christmas at work comes with two lists, and people tend to mix them up. One belongs to the company: clients, partners and the team, paid for by the business and sent under its name. The other is yours: the coworker who covered for you in August, your manager, the Secret Santa name you drew in the kitchen. They follow different rules, and most of the awkward moments in December happen when one is treated like the other.</p>

<p>This guide takes them in turn, with the 2026 calendar in mind. The tax side of company gifts (the CRA's $500 employee rule, and why food is only half deductible) has <a href="/guides/corporate-gifting-ontario-cra-rules-budgets-timing">its own guide</a>, and so does <a href="/guides/corporate-gift-hampers-how-to-choose">choosing the hamper itself</a>. Here the focus is on who, when, and how the gift lands.</p>

<h2>The 2026 calendar, and why the office closes sooner than you think</h2>

<p>Christmas Day is a Friday this year, Boxing Day a Saturday, and New Year's Day another Friday. In practice a lot of GTA offices will be thin from Friday 18 December, and plenty will not be fully back until Monday 4 January 2027.</p>

<p>That shrinks the window. A gift delivered to an office on the 22nd may sit at a locked reception desk over the break, and anything edible will still be waiting there in January. The week to aim for is <strong>7 to 11 December</strong>, with 14 to 16 December as the fallback. After that, send to homes or wait for the new year.</p>

<table>
<thead>
<tr><th>When</th><th>What to do</th></tr>
</thead>
<tbody>
<tr><td>October</td><td>Set the budget and draft the list. Decide which names are company gifts and which are personal.</td></tr>
<tr><td>Early November</td><td>Send us the brief for a <a href="/corporate/quote">corporate quote</a>. If anything is going to homes, ask staff for their addresses now.</td></tr>
<tr><td>Mid to late November</td><td>Approve the selection, settle the card wording, send the address list.</td></tr>
<tr><td>First week of December</td><td>Gifts shipping outside our local area should be on their way.</td></tr>
<tr><td>7 to 11 December</td><td>Office deliveries in Mississauga and the GTA. People are in, and party season has not yet emptied the floor.</td></tr>
<tr><td>14 to 16 December</td><td>The last safe days for offices. Anything later goes to a home address.</td></tr>
</tbody>
</table>

<p>One option that gets overlooked is to miss December on purpose. A gift that arrives in the first week of January, with a card wishing someone a good year, lands when their inbox is quiet and nobody else is sending anything. For clients you see only a few times a year, it can be the better choice.</p>

<h2>The company list</h2>

<p>Start with every name, then sort. Most businesses end up with something like this:</p>

<ul>
<li><strong>Key clients.</strong> The handful of relationships the year depended on. They get the most attention, a personal line on the card from whoever manages the account, and ideally delivery to a person, not a building.</li>
<li><strong>The wider client list.</strong> One consistent gift, sent well, beats five tiers nobody can keep track of.</li>
<li><strong>Referral sources and partners.</strong> The accountant who sends you work, the supplier who rushed an order through in June. Often forgotten, and usually the most surprised to be remembered.</li>
<li><strong>Your own team.</strong> Covered below, because it works differently.</li>
</ul>

<p>Keep the tiers few. Two is usually enough, and they should differ in size, not in how much care went into them. People at the same client compare notes more than you would expect.</p>

<h3>When the client has a gift policy</h3>

<p>Banks, insurers, hospitals, school boards and every level of government tend to have rules on what staff can accept, often capped at a modest value and sometimes at nothing. A gift that breaks the policy leaves your contact with two uncomfortable choices: send it back or declare it.</p>

<p>The usual way round this is one larger basket addressed to the team and set out in the kitchen for everyone. It reads as a thank-you to the office, not a personal benefit to one person, and most policies treat it that way. If you are not sure, ask your contact. It is a normal question in December, and they will be glad not to have to raise it themselves.</p>

<p>For sharing, <a href="/category/gourmet">gourmet snacks</a>, <a href="/category/chocolate">chocolate</a> and <a href="/category/coffee-tea">coffee and tea</a> work best: things that can be opened and passed round without plates or a knife.</p>

<h2>Gifts for your team</h2>

<p>Staff gifts are less about the basket and more about fairness. Everyone gets the same thing, or the tiers follow something visible like years of service, never who the manager gets on with. Part-timers and contract staff who worked the year with you belong on the list. So do people on parental or medical leave, who notice when they are left off.</p>

<p>December is also when the team is most scattered. Hybrid staff work from home that week, others are already away, and a basket left on an empty desk on the 18th is a sorry thing to come back to in January. Sending to homes solves it. Give people a few weeks' notice and a short form to give the address they want it sent to, and make it clear they can choose the office instead. We deliver to every address on the list across Ontario, with one invoice back to you. Our <a href="/recipients/employees">gifts for employees</a> are a good place to start.</p>

<p>If the budget only stretches to one thing, put it into the gift and skip the branded extras. Nobody keeps the logo pen.</p>

<h2>Coworkers, the boss and Secret Santa</h2>

<p>These come out of your own pocket, and the rule of thumb is simple: keep it small, and never leave anyone feeling they owe you one.</p>

<h3>Coworkers</h3>

<p>A gift for the one or two people you work most closely with is a kind gesture. A gift for the whole floor creates an obligation for everyone else on it. Something consumable is the safe choice, since it does not have to suit anyone's taste or fit on their desk. A small coffee and tea set, or something sweet to take home, is plenty.</p>

<h3>The boss</h3>

<p>Gifting up is where most people hesitate, and the hesitation is fair. A personal gift from one employee to a manager can look like an attempt to win favour, however well it was meant. The comfortable way to do it is together: the team chips in for one gift, everyone signs the card, and nobody stands out. A basket sent to the manager's home the week before Christmas, where it can be shared with their family, usually goes over better than one handed across a desk.</p>

<p>Going the other way is easier. A manager giving small, equal gifts to their direct reports is normal and welcome, as long as it is the same for everyone.</p>

<h3>Secret Santa</h3>

<p>A few things keep the office exchange friendly. Set a spending limit and say it out loud, because the person who spends three times the limit embarrasses everyone as much as the one who spends nothing. Ask people to add a line to their name slip about allergies or anything they don't eat. Skip gag gifts that only work if you know someone well, since at work you often don't. And make taking part optional, no questions asked.</p>

<p>We don't sell alcohol, and at work that is no great loss. Plenty of colleagues don't drink, some for reasons they would prefer not to explain at the office party, and a bottle is the gift most likely to land on the wrong desk.</p>

<h2>The people who keep the building running</h2>

<p>Reception, security, the cleaning crew, the mailroom, the courier who comes by every afternoon. They are missing from most corporate lists because they are not on anyone's org chart. A basket left at the front desk with a card from the whole office costs little and is remembered for a long time. It is a good job for whoever is organising the party.</p>

<h2>Merry Christmas or Happy Holidays?</h2>

<p>For family and friends, write whatever you would say at the door. For clients and teams in the GTA, "Happy holidays" or "Season's greetings" is the safer default unless you know the person celebrates Christmas, because the list almost certainly includes people who mark Hanukkah, another festival, or nothing in particular in December. The gift can stay the same. Our <a href="/occasions/holiday">holiday collection</a> is made for that kind of list, and our <a href="/occasions/christmas">Christmas baskets</a> are there for the people you know will enjoy them.</p>

<h2>What to write on a work card</h2>

<p>Every Velvéa gift includes a printed message card, and on corporate orders we can add your branding or write a different message for each recipient. Short is better. A few that work:</p>

<ul>
<li>To a client: "Thank you for a great year working together. Wishing you and your team a restful break."</li>
<li>To a referral partner: "Thank you for every introduction this year. We don't take them for granted."</li>
<li>To your team: "Thank you for everything you put into this year. Enjoy the break, you've earned it."</li>
<li>To the front desk: "From everyone on the fourth floor, thank you for keeping us going all year."</li>
<li>From the team to a manager: "Thanks for having our backs this year. Happy holidays from all of us."</li>
<li>In January: "Here's to a good 2027, and thank you for your business last year."</li>
</ul>

<p>For key clients, a line in the account manager's own words does more than any upgrade to the basket. More ideas are in <a href="/guides/what-to-write-in-a-gift-message">what to write in a gift message</a>.</p>

<h2>If you have left it late</h2>

<p>It happens every year. Across much of Mississauga and the GTA we offer <a href="/delivery">same-day and next-day delivery</a>, and the ready-to-send boxes on our <a href="/corporate">corporate page</a> go out without waiting for a quote. If December has got away from you entirely, the January gift described above is a good plan in its own right, not a consolation prize.</p>

<p>For more than a handful of gifts, the easiest start is to <a href="/corporate/quote">send us your list and budget</a>. We reply to every quote within one business day, and the earlier in November it reaches us, the more room there is to get it right. You can also browse <a href="/recipients/clients">gifts for clients</a> or <a href="/baskets">all gift baskets</a>.</p>`,

    fr: `<p>Noël au travail vient avec deux listes, et on a tendance à les confondre. La première appartient à l'entreprise : les clients, les partenaires et l'équipe, des cadeaux payés par l'entreprise et envoyés en son nom. La seconde est la vôtre : la collègue qui vous a remplacé en août, votre gestionnaire, le nom pigé pour l'échange de cadeaux. Elles obéissent à des règles différentes, et la plupart des malaises de décembre surviennent quand on traite l'une comme l'autre.</p>

<p>Ce guide les aborde l'une après l'autre, en tenant compte du calendrier 2026. Le volet fiscal des cadeaux d'entreprise (la règle de 500 $ de l'ARC pour les employés, et pourquoi les aliments ne sont déductibles qu'à moitié) a <a href="/fr/guides/corporate-gifting-ontario-cra-rules-budgets-timing">son propre guide</a>, tout comme <a href="/fr/guides/corporate-gift-hampers-how-to-choose">le choix du panier lui-même</a>. Ici, il est question de qui, de quand et de la façon dont le cadeau arrive.</p>

<h2>Le calendrier 2026, et pourquoi le bureau ferme plus tôt qu'on le pense</h2>

<p>Cette année, Noël tombe un vendredi, le lendemain de Noël un samedi et le jour de l'An un autre vendredi. Dans les faits, beaucoup de bureaux du Grand Toronto seront à moitié vides dès le vendredi 18 décembre, et bon nombre ne reprendront pleinement que le lundi 4 janvier 2027.</p>

<p>La fenêtre se rétrécit d'autant. Un cadeau livré au bureau le 22 risque d'attendre à une réception fermée pendant tout le congé, et ce qui se mange y sera encore en janvier. La semaine à viser est celle du <strong>7 au 11 décembre</strong>, avec le 14 au 16 décembre comme solution de repli. Passé ce délai, faites livrer à domicile ou attendez la nouvelle année.</p>

<table>
<thead>
<tr><th>Quand</th><th>Quoi faire</th></tr>
</thead>
<tbody>
<tr><td>Octobre</td><td>Fixez le budget et ébauchez la liste. Décidez quels noms relèvent de l'entreprise et lesquels sont personnels.</td></tr>
<tr><td>Début novembre</td><td>Envoyez-nous votre demande pour une <a href="/fr/corporate/quote">soumission d'entreprise</a>. Si des cadeaux partent à domicile, demandez dès maintenant leurs adresses aux employés.</td></tr>
<tr><td>Mi à fin novembre</td><td>Approuvez la sélection, arrêtez le texte des cartes, envoyez la liste d'adresses.</td></tr>
<tr><td>Première semaine de décembre</td><td>Les cadeaux expédiés hors de notre zone locale devraient être en route.</td></tr>
<tr><td>Du 7 au 11 décembre</td><td>Livraisons au bureau à Mississauga et dans le Grand Toronto. Les gens sont là, et la saison des partys n'a pas encore vidé les étages.</td></tr>
<tr><td>Du 14 au 16 décembre</td><td>Les derniers jours sûrs pour les bureaux. Au-delà, livrez à domicile.</td></tr>
</tbody>
</table>

<p>Une option qu'on oublie souvent : manquer décembre exprès. Un cadeau qui arrive la première semaine de janvier, avec une carte souhaitant une bonne année, tombe au moment où la boîte de réception est calme et où personne d'autre n'envoie quoi que ce soit. Pour les clients que vous ne voyez que quelques fois par année, c'est parfois le meilleur choix.</p>

<h2>La liste de l'entreprise</h2>

<p>Commencez par tous les noms, puis classez-les. La plupart des entreprises arrivent à quelque chose comme ceci :</p>

<ul>
<li><strong>Les clients clés.</strong> La poignée de relations dont l'année a dépendu. Ils reçoivent le plus d'attention, un mot personnel sur la carte de la part de la personne qui gère le compte et, idéalement, une livraison à une personne plutôt qu'à un immeuble.</li>
<li><strong>Le reste de la clientèle.</strong> Un seul cadeau, toujours le même et bien envoyé, vaut mieux que cinq catégories dont personne ne se souvient.</li>
<li><strong>Sources de recommandations et partenaires.</strong> Le comptable qui vous envoie des clients, le fournisseur qui a pressé une commande en juin. Souvent oubliés, et généralement les plus surpris qu'on pense à eux.</li>
<li><strong>Votre propre équipe.</strong> Traitée plus bas, parce que les règles changent.</li>
</ul>

<p>Limitez le nombre de catégories. Deux suffisent habituellement, et elles devraient différer par la taille, pas par le soin qu'on y a mis. Les gens d'une même entreprise cliente comparent leurs cadeaux plus qu'on ne l'imagine.</p>

<h3>Quand le client a une politique sur les cadeaux</h3>

<p>Les banques, les assureurs, les hôpitaux, les conseils scolaires et tous les ordres de gouvernement ont souvent des règles sur ce que leur personnel peut accepter, généralement plafonné à une valeur modeste, parfois à zéro. Un cadeau qui enfreint la politique place votre contact devant deux choix gênants : le renvoyer ou le déclarer.</p>

<p>La solution habituelle est un seul panier plus grand, adressé à l'équipe et déposé dans la cuisine pour tout le monde. Il se lit comme un remerciement au bureau, et non comme un avantage personnel pour une seule personne, et la plupart des politiques le voient ainsi. En cas de doute, posez la question à votre contact. C'est une question normale en décembre, et il sera content de ne pas avoir à l'aborder lui-même.</p>

<p>Pour partager, les <a href="/fr/category/gourmet">collations gourmandes</a>, le <a href="/fr/category/chocolate">chocolat</a> et le <a href="/fr/category/coffee-tea">café et thé</a> conviennent le mieux : des choses qu'on ouvre et qu'on fait circuler sans assiette ni couteau.</p>

<h2>Les cadeaux pour votre équipe</h2>

<p>Les cadeaux au personnel tiennent moins au panier qu'à l'équité. Tout le monde reçoit la même chose, ou les catégories suivent un critère visible comme les années de service, jamais les affinités du gestionnaire. Les employés à temps partiel et les contractuels qui ont travaillé l'année avec vous ont leur place sur la liste. Les personnes en congé parental ou de maladie aussi : elles remarquent quand on les oublie.</p>

<p>Décembre est aussi le mois où l'équipe est la plus dispersée. Le personnel hybride travaille de la maison cette semaine-là, d'autres sont déjà partis, et un panier laissé sur un bureau vide le 18 est une triste découverte au retour en janvier. La livraison à domicile règle la question. Prévenez les gens quelques semaines à l'avance avec un court formulaire où indiquer l'adresse de leur choix, et précisez qu'ils peuvent opter pour le bureau. Nous livrons à chaque adresse de la liste partout en Ontario, avec une seule facture pour vous. Nos <a href="/fr/recipients/employees">cadeaux pour employés</a> sont un bon point de départ.</p>

<p>Si le budget ne permet qu'une chose, mettez-le dans le cadeau et laissez tomber les articles promotionnels. Personne ne garde le stylo au logo.</p>

<h2>Collègues, patron et échange de cadeaux</h2>

<p>Ces cadeaux-là sortent de votre poche, et la règle est simple : restez modeste, et ne donnez jamais à quelqu'un l'impression qu'il vous en doit un.</p>

<h3>Les collègues</h3>

<p>Un cadeau pour les une ou deux personnes avec qui vous travaillez de plus près est un beau geste. Un cadeau pour tout l'étage crée une obligation pour tous les autres. Quelque chose qui se mange ou se boit est le choix sûr, puisqu'il n'a pas à plaire au goût de chacun ni à trouver sa place sur un bureau. Un petit assortiment de café et de thé, ou une douceur à rapporter à la maison, suffit amplement.</p>

<h3>Le patron</h3>

<p>Offrir à son supérieur, c'est là que la plupart des gens hésitent, et l'hésitation est légitime. Un cadeau personnel d'un employé à son gestionnaire peut donner l'impression qu'on cherche à se faire bien voir, même avec les meilleures intentions. La façon confortable de le faire, c'est ensemble : l'équipe se cotise pour un seul cadeau, tout le monde signe la carte et personne ne se démarque. Un panier livré au domicile du gestionnaire la semaine avant Noël, où il pourra le partager avec sa famille, est généralement mieux reçu qu'un cadeau remis par-dessus un bureau.</p>

<p>Dans l'autre sens, c'est plus simple. Un gestionnaire qui offre de petits cadeaux identiques à son équipe directe, c'est normal et apprécié, tant que c'est pareil pour tout le monde.</p>

<h3>L'échange de cadeaux</h3>

<p>Quelques règles gardent l'échange de bureau sympathique. Fixez un montant maximum et dites-le clairement, parce que la personne qui dépense le triple met tout le monde aussi mal à l'aise que celle qui ne dépense rien. Demandez à chacun d'ajouter une ligne sur son papier au sujet de ses allergies ou de ce qu'il ne mange pas. Évitez les cadeaux farfelus qui ne fonctionnent que si l'on connaît bien la personne, puisqu'au travail, ce n'est souvent pas le cas. Et rendez la participation facultative, sans poser de questions.</p>

<p>Nous ne vendons pas d'alcool, et au travail, ce n'est pas une grande perte. Bien des collègues ne boivent pas, certains pour des raisons qu'ils préfèrent ne pas expliquer au party de bureau, et une bouteille est le cadeau le plus susceptible d'atterrir sur le mauvais bureau.</p>

<h2>Les gens qui font tourner l'immeuble</h2>

<p>La réception, la sécurité, l'équipe d'entretien, le courrier, le livreur qui passe chaque après-midi. Ils manquent à la plupart des listes d'entreprise parce qu'ils ne figurent dans aucun organigramme. Un panier déposé à la réception avec une carte de tout le bureau coûte peu et marque longtemps. C'est une belle tâche pour la personne qui organise le party.</p>

<h2>Joyeux Noël ou Joyeuses Fêtes?</h2>

<p>Pour la famille et les amis, écrivez ce que vous diriez sur le pas de la porte. Pour les clients et les équipes du Grand Toronto, « Joyeuses Fêtes » ou « Meilleurs vœux de saison » est le choix le plus sûr, à moins de savoir que la personne fête Noël, parce que la liste comprend presque certainement des gens qui célèbrent Hanoukka, une autre fête, ou rien de particulier en décembre. Le cadeau, lui, peut rester le même. Notre <a href="/fr/occasions/holiday">collection des Fêtes</a> est faite pour ce genre de liste, et nos <a href="/fr/occasions/christmas">paniers de Noël</a> sont là pour les personnes dont vous savez qu'elles les apprécieront.</p>

<h2>Quoi écrire sur une carte professionnelle</h2>

<p>Chaque cadeau Velvéa comprend une carte-message imprimée, et pour les commandes d'entreprise, nous pouvons y ajouter votre image de marque ou écrire un message différent pour chaque destinataire. Court, c'est mieux. Quelques exemples :</p>

<ul>
<li>À un client : « Merci pour cette belle année de collaboration. Nous vous souhaitons, à vous et à votre équipe, un congé reposant. »</li>
<li>À un partenaire de recommandation : « Merci pour chaque présentation cette année. Nous ne les tenons pas pour acquises. »</li>
<li>À votre équipe : « Merci pour tout ce que vous avez donné cette année. Profitez du congé, vous l'avez bien mérité. »</li>
<li>À la réception : « De la part de tout le quatrième étage, merci de nous avoir fait tourner toute l'année. »</li>
<li>De l'équipe à un gestionnaire : « Merci de nous avoir soutenus cette année. Joyeuses Fêtes de nous tous. »</li>
<li>En janvier : « À une belle année 2027, et merci de votre confiance l'an dernier. »</li>
</ul>

<p>Pour les clients clés, quelques mots dans les propres termes du responsable du compte valent plus que n'importe quel panier plus gros. D'autres idées vous attendent dans <a href="/fr/guides/what-to-write-in-a-gift-message">quoi écrire dans un message de cadeau</a>.</p>

<h2>Si vous vous y prenez tard</h2>

<p>Ça arrive chaque année. Dans une grande partie de Mississauga et du Grand Toronto, nous offrons la <a href="/fr/delivery">livraison le jour même ou le lendemain</a>, et les coffrets prêts à envoyer de notre <a href="/fr/corporate">page entreprises</a> partent sans attendre de soumission. Si décembre vous a complètement échappé, le cadeau de janvier décrit plus haut est un bon plan en soi, pas un prix de consolation.</p>

<p>Au-delà de quelques cadeaux, le plus simple est de <a href="/fr/corporate/quote">nous envoyer votre liste et votre budget</a>. Nous répondons à chaque demande de soumission en un jour ouvrable, et plus tôt elle nous parvient en novembre, plus nous avons de latitude pour bien faire les choses. Vous pouvez aussi parcourir nos <a href="/fr/recipients/clients">cadeaux pour clients</a> ou <a href="/fr/baskets">tous les paniers-cadeaux</a>.</p>`,
  },
};

import type { GuideSeed } from "./types";

/**
 * Birthday is the largest occasion collection in the catalogue and the most
 * searched gifting occasion all year, with no season to wait for. The guide
 * answers what people search ("birthday gift basket ideas", "what to send for
 * a birthday", "same-day birthday delivery Mississauga") by recipient, since
 * that is how people decide.
 *
 * No product names and no prices, same rule as the other guides: the catalogue
 * turns over. No same-day cutoff time either: cutoffs are per delivery zone
 * (`src/lib/zones.ts`), so the copy sends readers to the delivery page and
 * checkout for the real time.
 *
 * Only links collections that held products when written (birthday, a-friend,
 * for-her, for-him, family, employees, clients, chocolate, coffee-tea,
 * gourmet, spa-wellness).
 */
export const birthdayGiftBaskets: GuideSeed = {
  slug: "birthday-gift-basket-ideas",
  category: "OCCASIONS",
  readMinutes: 6,
  featured: false,
  title: {
    en: "Birthday gift basket ideas for everyone on your list",
    fr: "Idées de paniers-cadeaux d'anniversaire pour tout le monde sur votre liste",
  },
  excerpt: {
    en: "How to choose a birthday basket for a friend, a parent, a partner or a colleague, what to do about milestone birthdays and office birthdays, and how to still get a gift there on the day when you remembered late.",
    fr: "Comment choisir un panier d'anniversaire pour une amie, un parent, un partenaire ou un collègue, que faire pour les anniversaires marquants et ceux du bureau, et comment faire arriver le cadeau le jour même quand on y pense tard.",
  },
  seoTitle: {
    en: "Birthday Gift Basket Ideas: Who to Send What, and When",
    fr: "Idées de paniers-cadeaux d'anniversaire : quoi offrir et quand",
  },
  seoDescription: {
    en: "Birthday gift basket ideas for friends, parents, partners and coworkers, plus milestone birthdays, office birthdays and same-day birthday delivery in Mississauga and the GTA.",
    fr: "Idées de paniers-cadeaux d'anniversaire pour amis, parents, partenaires et collègues, anniversaires marquants, anniversaires au bureau et livraison le jour même à Mississauga et dans le Grand Toronto.",
  },
  body: {
    en: `<p>A birthday comes round for everyone, every year, and there is no season to plan around. That is also why birthday gifts go wrong so often. They get bought in a hurry, the night before, by someone who meant to think about it sooner.</p>

<p>A gift basket solves two birthday problems at once. It arrives already wrapped and ready to open, and it can be delivered to a door you cannot get to yourself. Below is how to choose one well for the people most of us end up buying for.</p>

<h2>Start with the person, not the basket</h2>

<p>Before you look at a single product, answer three questions about the person whose birthday it is. The first is whether they will share it or keep it. Someone who lives with family or a roommate will open a food basket for the whole house, while someone who lives alone may get more from a gift that is only for them.</p>

<p>Next, is there a treat they always come back to, like coffee every morning, dark chocolate after dinner or a long bath on Sunday? A basket built around a habit they already love gets used. Finally, is there anything they cannot eat? Nut allergies, vegetarian or halal diets and gluten all count. A food basket is only a good gift if the person can eat what is in it.</p>

<p>Those answers narrow the field faster than any list of ideas. Our guide to <a href="/guides/how-to-choose-a-gift-basket">choosing a gift basket</a> goes into more detail on matching contents to a person.</p>

<h2>Birthday ideas by recipient</h2>

<h3>For a friend</h3>

<p>Friends give you the most room. <a href="/category/chocolate">Chocolate</a> is the safe favourite, and a <a href="/category/gourmet">gourmet snack</a> basket suits the friend who always brings the cheese board. If you know them well, pick the one thing they would never buy for themselves. See all <a href="/recipients/a-friend">gifts for a friend</a>.</p>

<h3>For your mum, a sister or a partner</h3>

<p>Here a <a href="/category/spa-wellness">spa and wellness</a> basket earns its place. It says "take an evening for yourself", and that is often the one thing nobody else gives her. Add chocolate if you want something to share. Browse <a href="/recipients/for-her">gifts for her</a>.</p>

<h3>For your dad, a brother or a partner</h3>

<p>Food and drink usually win. Go for a <a href="/category/coffee-tea">coffee and tea</a> basket if he starts every day with a cup, or a savoury gourmet basket if he grazes. Browse <a href="/recipients/for-him">gifts for him</a>.</p>

<h3>For a parent or grandparent who "doesn't need anything"</h3>

<p>Most lists have one of these, and it is the hardest birthday to buy for. The answer is something they can eat or drink: nothing to dust, nothing to find a place for. A basket of good tea, biscuits and something sweet gets enjoyed over a few weeks, and a parent who says they need nothing will usually accept a treat. Our <a href="/recipients/family">family gift baskets</a> are a good place to start.</p>

<h3>For a colleague</h3>

<p>Shareable and neutral is the rule. A basket that gets opened in the break room, so everyone has a piece of the celebration, goes down better than something personal. If the whole team is chipping in, one generous basket beats a pile of small gifts.</p>

<h3>For a client</h3>

<p>Most businesses never send a client a birthday gift, which is exactly why the gift gets remembered. Send it to the office if you know they are in that day, and keep the card warm but professional. See <a href="/recipients/clients">gifts for clients</a>.</p>

<h2>Milestone birthdays</h2>

<p>A 30th, 40th, 50th or 60th calls for a different gift. People mark these with a party or a dinner, and a basket that arrives the week of the birthday becomes part of the occasion.</p>

<p>This is the time to go a size up from whatever you would normally send. If there is a gathering, a shareable basket delivered the day before gives the host something to put out. And use the card. A milestone can carry a memory or a line about the decade ahead, not only "happy birthday".</p>

<h2>Office birthdays</h2>

<p>Workplace birthdays are small, and teams notice them. Three practical points:</p>

<ul>
<li><strong>Check the day.</strong> If the birthday falls on a weekend, deliver on the Friday before, or send it to their home.</li>
<li><strong>Check the address.</strong> Many office buildings receive deliveries at a front desk or loading dock. Add the suite number and a phone number in the delivery notes so the basket reaches the person, not the mailroom.</li>
<li><strong>Be consistent.</strong> If you mark one person's birthday, mark everyone's. HR teams sending to a whole staff list can <a href="/corporate/quote">request a corporate quote</a>, and our <a href="/recipients/employees">employee gift baskets</a> are built for it.</li>
</ul>

<h2>When you remembered late</h2>

<p>It happens to everyone. Across much of Mississauga and the GTA, <a href="/delivery">same-day and next-day delivery</a> can still get a basket there on the birthday itself. The cutoff depends on the delivery address, and checkout shows the options for a postal code before you pay, so you will know straight away whether today is still possible.</p>

<p>If the person lives outside our local delivery area, choose a basket marked as shippable and allow a few days. Each product page says whether it can be shipped.</p>

<h2>What to write on a birthday card</h2>

<p>Every Velvéa gift includes a printed message card. A line or two is plenty.</p>

<ul>
<li>"Happy birthday! I hope this year is your best one yet."</li>
<li>"Happy birthday to my favourite person. Put your feet up tonight, you've earned it."</li>
<li>"Happy 40th! Here's to the next decade of adventures."</li>
<li>For a colleague: "Happy birthday from all of us on the team. Enjoy your day!"</li>
<li>For a client: "Wishing you a very happy birthday, and thank you for being such a pleasure to work with."</li>
</ul>

<p>For more wording help, including belated birthdays, see <a href="/guides/what-to-write-in-a-gift-message">what to write in a gift message</a>.</p>

<p>Most people find what they need in our <a href="/occasions/birthday">birthday gift baskets</a>. If nothing there feels right, <a href="/baskets">all gift baskets</a> are one click away. And if the date has already crept up on you, it is worth checking today's delivery options before you settle for a card.</p>`,

    fr: `<p>L'anniversaire revient pour tout le monde, chaque année, et il n'y a pas de saison autour de laquelle s'organiser. C'est aussi pourquoi les cadeaux d'anniversaire ratent si souvent. On les achète à la hâte, la veille, en se promettant d'y penser plus tôt la prochaine fois.</p>

<p>Un panier-cadeau règle deux problèmes d'un coup. Il arrive déjà emballé, prêt à ouvrir, et il peut être livré à une porte où vous ne pouvez pas aller vous-même. Voici comment bien le choisir pour les personnes à qui l'on finit par offrir le plus souvent.</p>

<h2>Partez de la personne, pas du panier</h2>

<p>Avant de regarder un seul produit, répondez à trois questions sur la personne fêtée. La première : va-t-elle le partager ou le garder? Quelqu'un qui vit en famille ou en colocation ouvrira un panier gourmand pour toute la maison, alors qu'une personne qui vit seule appréciera peut-être davantage un cadeau rien que pour elle.</p>

<p>Ensuite, a-t-elle un petit plaisir auquel elle revient toujours, comme le café chaque matin, le chocolat noir après le souper ou un long bain le dimanche? Un panier construit autour d'une habitude qu'elle aime déjà sera utilisé. Enfin, y a-t-il quelque chose qu'elle ne peut pas manger? Allergie aux noix, alimentation végétarienne ou halal, gluten : tout compte. Un panier gourmand n'est un bon cadeau que si la personne peut en manger le contenu.</p>

<p>Ces réponses réduisent le choix plus vite que n'importe quelle liste d'idées. Notre guide pour <a href="/fr/guides/how-to-choose-a-gift-basket">choisir un panier-cadeau</a> explique plus en détail comment accorder le contenu à la personne.</p>

<h2>Idées d'anniversaire selon la personne</h2>

<h3>Pour une amie ou un ami</h3>

<p>Avec les amis, vous avez le plus de latitude. Un panier de <a href="/fr/category/chocolate">chocolat</a> est le favori sans risque, et un panier de <a href="/fr/category/gourmet">collations gourmandes</a> convient à celui qui apporte toujours le plateau de fromages. Si vous le connaissez bien, choisissez la chose qu'il ne s'achèterait jamais lui-même. Voyez tous les <a href="/fr/recipients/a-friend">cadeaux pour un ami</a>.</p>

<h3>Pour votre mère, une sœur ou une partenaire</h3>

<p>Ici, un panier <a href="/fr/category/spa-wellness">spa et bien-être</a> prend tout son sens. Il dit « prends une soirée pour toi », et c'est souvent la seule chose que personne d'autre ne lui offre. Ajoutez du chocolat si vous voulez quelque chose à partager. Parcourez les <a href="/fr/recipients/for-her">cadeaux pour elle</a>.</p>

<h3>Pour votre père, un frère ou un partenaire</h3>

<p>La nourriture et les boissons l'emportent généralement. Optez pour un panier <a href="/fr/category/coffee-tea">café et thé</a> s'il commence chaque journée par une tasse, ou pour un panier gourmand salé s'il aime grignoter. Parcourez les <a href="/fr/recipients/for-him">cadeaux pour lui</a>.</p>

<h3>Pour un parent ou un grand-parent qui « n'a besoin de rien »</h3>

<p>La plupart des listes en comptent un, et c'est l'anniversaire le plus difficile. La réponse : quelque chose qui se mange ou se boit, sans rien à épousseter ni à ranger. Un panier de bon thé, de biscuits et d'une douceur se savoure sur quelques semaines, et un parent qui dit n'avoir besoin de rien accepte presque toujours une gâterie. Nos <a href="/fr/recipients/family">paniers-cadeaux pour la famille</a> sont un bon point de départ.</p>

<h3>Pour un ou une collègue</h3>

<p>La règle : un cadeau à partager, et neutre. Un panier qu'on ouvre dans la salle de pause, pour que chacun profite un peu de la fête, est mieux reçu qu'un cadeau personnel. Si toute l'équipe contribue, un seul panier généreux vaut mieux qu'une pile de petits cadeaux.</p>

<h3>Pour un client</h3>

<p>La plupart des entreprises n'offrent jamais de cadeau d'anniversaire à leurs clients, et c'est justement pour cela qu'on se souvient de celles qui le font. Faites-le livrer au bureau si vous savez que la personne y sera ce jour-là, et gardez une carte chaleureuse mais professionnelle. Voyez les <a href="/fr/recipients/clients">cadeaux pour clients</a>.</p>

<h2>Les anniversaires marquants</h2>

<p>Un 30e, un 40e, un 50e ou un 60e appelle un autre cadeau. On les souligne avec une fête ou un souper, et un panier qui arrive la semaine de l'anniversaire fait partie de l'événement.</p>

<p>C'est le moment de prendre la taille au-dessus de ce que vous offririez d'habitude. S'il y a une réception, un panier à partager livré la veille donne à l'hôte quelque chose à mettre sur la table. Et profitez de la carte. Pour un anniversaire marquant, elle peut porter un souvenir ou un mot sur la décennie à venir, pas seulement « bonne fête ».</p>

<h2>Les anniversaires au bureau</h2>

<p>Les anniversaires au travail sont un petit geste, et les équipes le remarquent. Trois points pratiques :</p>

<ul>
<li><strong>Vérifiez le jour.</strong> Si l'anniversaire tombe un week-end, livrez le vendredi précédent ou à la maison.</li>
<li><strong>Vérifiez l'adresse.</strong> Beaucoup d'immeubles de bureaux reçoivent les livraisons à l'accueil ou au quai de chargement. Ajoutez le numéro de bureau et un numéro de téléphone dans les instructions de livraison pour que le panier arrive à la personne, pas au courrier.</li>
<li><strong>Soyez constant.</strong> Si vous soulignez l'anniversaire d'une personne, soulignez celui de tout le monde. Les équipes RH qui envoient à toute une liste peuvent <a href="/fr/corporate/quote">demander une soumission d'entreprise</a>, et nos <a href="/fr/recipients/employees">paniers pour employés</a> sont pensés pour cela.</li>
</ul>

<h2>Quand vous y avez pensé tard</h2>

<p>Ça arrive à tout le monde. Dans une grande partie de Mississauga et du Grand Toronto, la <a href="/fr/delivery">livraison le jour même ou le lendemain</a> peut encore faire arriver un panier le jour de l'anniversaire. L'heure limite dépend de l'adresse de livraison, et le paiement affiche les options pour un code postal avant que vous payiez : vous saurez tout de suite si c'est encore possible aujourd'hui.</p>

<p>Si la personne habite hors de notre zone de livraison locale, choisissez un panier indiqué comme expédiable et prévoyez quelques jours. Chaque fiche produit précise s'il peut être expédié.</p>

<h2>Quoi écrire sur une carte d'anniversaire</h2>

<p>Chaque cadeau Velvéa comprend une carte-message imprimée. Une ligne ou deux suffisent.</p>

<ul>
<li>« Bonne fête! J'espère que cette année sera la plus belle de toutes. »</li>
<li>« Bonne fête à ma personne préférée. Repose-toi ce soir, tu l'as bien mérité. »</li>
<li>« Joyeux 40e! À la prochaine décennie d'aventures. »</li>
<li>Pour une ou un collègue : « Bonne fête de la part de toute l'équipe. Profite bien de ta journée! »</li>
<li>Pour un client : « Nous vous souhaitons un très joyeux anniversaire, et merci d'être un partenaire aussi agréable. »</li>
</ul>

<p>Pour d'autres idées de formulation, y compris pour un anniversaire en retard, consultez <a href="/fr/guides/what-to-write-in-a-gift-message">quoi écrire dans un message de cadeau</a>.</p>

<p>La plupart des gens trouvent leur bonheur parmi nos <a href="/fr/occasions/birthday">paniers-cadeaux d'anniversaire</a>. Si rien ne vous convient, <a href="/fr/baskets">tous les paniers-cadeaux</a> sont à un clic. Et si la date vous a pris de court, vérifiez les options de livraison du jour avant de vous rabattre sur une simple carte.</p>`,
  },
};

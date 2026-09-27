import type { GuideSeed } from "./types";

/**
 * The "help me decide" guide, organised by recipient so it maps onto the
 * recipient collections.
 *
 * Deliberately links collections and categories rather than individual
 * products, and names no product. The catalogue turns over seasonally — the
 * Thanksgiving baskets will be gone by November — and a guide that name-checks
 * products becomes wrong without anybody editing it. Collections stay.
 *
 * Only non-empty collections are linked: `new-parents`, `fresh-fruit`, `vegan`
 * and `baby` exist in the nav but hold no products, and an empty collection is
 * a noindex page and a dead end. Check the sitemap before adding a link here.
 */
export const choosingABasket: GuideSeed = {
  slug: "how-to-choose-a-gift-basket",
  category: "RECIPIENTS",
  readMinutes: 7,
  featured: false,
  title: {
    en: "How to choose a gift basket for someone",
    fr: "Comment choisir un panier-cadeau pour quelqu'un",
  },
  excerpt: {
    en: "Start with where the gift will land rather than who it is for. A practical guide to budgets, shareable versus personal gifts, when flowers are the wrong call, and what to send for each kind of recipient.",
    fr: "Commencez par l'endroit où le cadeau atterrira plutôt que par la personne. Guide pratique des budgets, des cadeaux à partager ou personnels, et de ce qu'il faut envoyer à chaque type de destinataire.",
  },
  seoTitle: {
    en: "How to Choose a Gift Basket: A Practical Guide by Recipient",
    fr: "Comment choisir un panier-cadeau : guide pratique par destinataire",
  },
  seoDescription: {
    en: "How to pick the right gift basket: realistic budgets, shareable versus personal gifts, dietary considerations, when to avoid fresh flowers, and what works for partners, parents, friends, colleagues and clients.",
    fr: "Comment choisir le bon panier-cadeau : budgets réalistes, cadeaux à partager ou personnels, considérations alimentaires et ce qui convient à chaque destinataire.",
  },
  body: {
    en: `<p>Most people choose a gift basket by scrolling until something looks nice. That works often enough, but it is also how a box of delicate chocolates ends up on a shared office table where eleven people take one each, or how a beautiful fresh-flower arrangement arrives at a hospital ward that does not allow them.</p>

<p>There is a better first question, and it is not "who is this for".</p>

<h2>Start with where it lands</h2>

<p>The single most useful thing to know is the room the gift arrives in. It decides more than the recipient's taste does.</p>

<ul>
<li><strong>A home, received by one person.</strong> Anything works. This is the only scenario where a truly personal gift makes sense: skincare, a scent, a single indulgence meant for them and nobody else.</li>
<li><strong>A home with a family in it.</strong> Assume it gets shared. Something divisible beats something precious.</li>
<li><strong>An office or a shared desk.</strong> It will be opened in front of people and it will be shared, whether or not that was the intention. Choose volume and variety over refinement, and avoid anything that implies intimacy.</li>
<li><strong>A hospital or care setting.</strong> Check first. Many wards restrict fresh flowers and some restrict food altogether. This is worth a phone call, not a guess.</li>
<li><strong>A household in the middle of something</strong> — a new baby, a bereavement, an illness. Send things that need nothing: no assembly, no refrigeration, no vase, no decisions.</li>
</ul>

<p>If you answer only this question and nothing else in this guide, you will still choose better than most people.</p>

<h2>What to spend</h2>

<p>Our range runs from about $70 to $360, and the tiers mean roughly this:</p>

<table>
<thead>
<tr><th>Range</th><th>What it reads as</th><th>Good for</th></tr>
</thead>
<tbody>
<tr><td>$70–$110</td><td>Thoughtful, unfussy, no obligation created</td><td>Host gifts, colleagues, thank-yous, a friend having a week</td></tr>
<tr><td>$130–$200</td><td>A real gift, clearly chosen, not grabbed</td><td>Birthdays, parents, close friends, key clients</td></tr>
<tr><td>$250–$360</td><td>An occasion in itself</td><td>Milestone anniversaries, a significant thank-you, a partner</td></tr>
</tbody>
</table>

<p>One caution: spending far above the relationship can misfire. A gift that is dramatically more generous than the recipient expected can leave them feeling they now owe you something, which is the opposite of what you wanted. The tier should match the relationship, not your budget.</p>

<h2>Shareable or personal: decide deliberately</h2>

<p>This is the distinction people get wrong most often, and it is easy to get right.</p>

<p><strong>Shareable</strong> means many small items, ideally individually wrapped: snacks, chocolates, biscuits, coffee. It survives being opened in front of a room. Nobody feels awkward taking one.</p>

<p><strong>Personal</strong> means fewer, better things meant for one person: skincare, a fragrance, a single beautiful object. It is a warm gift to open alone and an awkward one to open at a desk with colleagues watching.</p>

<p>When you do not know the situation, shareable is the safer default. A <a href="/category/gourmet">gourmet and snacks</a> basket is almost impossible to get wrong; a spa set can be, in the wrong room.</p>

<h2>Before you order: dietary restrictions</h2>

<p>Food gifts carry a real risk that flowers and candles do not. If you know of an allergy, a dietary restriction or a recent health change, it should override every other consideration in this guide, including how good the basket looks.</p>

<p>If you are not certain, <a href="/contact">ask us</a> what is in a basket before you order instead of hoping. Our baskets are assembled by hand after you order, so we can tell you exactly what a given basket contains. If the answer rules it out, <a href="/category/spa-wellness">spa and wellness</a> sidesteps the question.</p>

<p>One more: we sell no alcohol at all. For some recipients that is a neutral fact, and for others it is precisely why a basket is the right choice.</p>

<h2>When fresh flowers are the wrong call</h2>

<p>Several of our baskets are built around fresh blooms, and they are the most striking things we make. They are also the most situational.</p>

<p><strong>Flowers work</strong> when the gift is going to a home, will be received by someone who is there, and the moment is celebratory or affectionate.</p>

<p><strong>Flowers do not work</strong> when the recipient is in a hospital that restricts them, when the gift is going to an office where it becomes somebody's problem to water, when nobody will be home to receive it, or when the address is outside our local delivery area. Fresh flowers do not travel by courier, so flower baskets are local delivery and pickup only. Anything that cannot be shipped is marked on its product page, and checkout will tell you before you pay.</p>

<h2>By recipient</h2>

<h3>A partner</h3>

<p>The one case where personal beats shareable without question, and where the tier can sit higher than usual. Flowers, chocolate and self-care together is the classic combination for a reason. See <a href="/recipients/couples">couples</a>.</p>

<h3>A parent</h3>

<p>Comfort reads better than luxury here. Coffee, tea, something to sit down with: the things that make an ordinary morning feel deliberate. Avoid anything that needs learning or setting up. See <a href="/category/coffee-tea">coffee and tea</a>.</p>

<h3>A close friend</h3>

<p>You know enough to be specific, so be specific. This is the recipient where the card matters as much as the basket. See <a href="/guides/what-to-write-in-a-gift-message">what to write in a gift message</a>. See <a href="/recipients/a-friend">for a friend</a>.</p>

<h3>Someone having a hard time</h3>

<p>Send things that require nothing. No assembly, no decisions, no reply expected. Comfort food, tea, something soft. Do not send anything that needs to be dealt with today. See <a href="/occasions/thinking-of-you">thinking of you</a> and <a href="/occasions/get-well">get well</a>.</p>

<h3>A colleague or a team</h3>

<p>Shareable, unmistakably. Variety over refinement, nothing that implies intimacy, nothing that needs refrigerating in an office kitchen. See <a href="/recipients/employees">for employees</a>.</p>

<h3>A client</h3>

<p>Shareable again: most client gifts get opened in a shared space. Keep the card free of anything resembling a sales message. The <a href="/guides/corporate-gifting-ontario-cra-rules-budgets-timing">corporate gifting guide</a> covers budgets, the tax treatment and multi-address delivery. See <a href="/recipients/clients">for clients</a>.</p>

<h3>A whole household</h3>

<p>Assume it gets divided. Sweet and savoury together covers more people than either alone. See <a href="/recipients/family">for a family</a>.</p>

<h3>When you barely know them</h3>

<p>A new neighbour, a client's assistant, someone doing you a professional favour. Go shelf-stable, shareable and mid-range. Warmth without presumption is the brief. See <a href="/occasions/thank-you">thank you</a>.</p>

<h2>Three things to avoid</h2>

<ol>
<li><strong>A gift that creates a task.</strong> Anything needing a vase, a fridge, assembly or a decision on arrival is work handed over in nice packaging.</li>
<li><strong>Guessing on dietary restrictions.</strong> Ask, or choose something that avoids the question.</li>
<li><strong>Leaving it to the day before.</strong> Baskets are assembled after you order, and an order placed after the daily cutoff starts the following day. <a href="/delivery">Same-day delivery</a> is available across much of the GTA, but it depends on the address and the cutoff. The <a href="/guides/ontario-gifting-calendar-thanksgiving-to-holidays">gifting calendar</a> explains how the timing works.</li>
</ol>

<p>Still deciding? <a href="/baskets">Browse everything</a>, or narrow by <a href="/recipients/for-her">for her</a>, <a href="/recipients/for-him">for him</a>, or <a href="/category/chocolate">chocolate</a>.</p>`,

    fr: `<p>La plupart des gens choisissent un panier-cadeau en faisant défiler la page jusqu'à ce que quelque chose leur plaise. Cela fonctionne assez souvent, mais c'est aussi ainsi qu'une boîte de chocolats fins se retrouve sur une table de bureau partagée où onze personnes en prennent un chacune, ou qu'un superbe arrangement de fleurs fraîches arrive dans une unité hospitalière qui ne les accepte pas.</p>

<p>Il existe une meilleure première question, et ce n'est pas « pour qui est-ce ».</p>

<h2>Commencez par l'endroit où il atterrit</h2>

<p>Ce qu'il est le plus utile de savoir, c'est la pièce dans laquelle le cadeau arrive. Cela décide davantage que les goûts du destinataire.</p>

<ul>
<li><strong>Un domicile, reçu par une seule personne.</strong> Tout fonctionne. C'est le seul cas où un cadeau vraiment personnel a du sens : soins de la peau, un parfum, une gourmandise destinée à cette personne et à personne d'autre.</li>
<li><strong>Un domicile où vit une famille.</strong> Présumez qu'il sera partagé. Quelque chose de divisible vaut mieux que quelque chose de précieux.</li>
<li><strong>Un bureau ou un poste de travail partagé.</strong> Il sera ouvert devant des gens et il sera partagé, que ce soit voulu ou non. Privilégiez le volume et la variété au raffinement, et évitez tout ce qui suppose une intimité.</li>
<li><strong>Un hôpital ou un milieu de soins.</strong> Vérifiez d'abord. Beaucoup d'unités restreignent les fleurs fraîches et certaines restreignent la nourriture. Cela mérite un appel plutôt qu'une supposition.</li>
<li><strong>Un foyer en pleine épreuve</strong> — une naissance, un deuil, une maladie. Envoyez des choses qui n'exigent rien : aucun assemblage, aucune réfrigération, aucun vase, aucune décision.</li>
</ul>

<p>Si vous ne répondez qu'à cette question et à rien d'autre dans ce guide, vous choisirez tout de même mieux que la plupart des gens.</p>

<h2>Combien dépenser</h2>

<p>Notre gamme s'étend d'environ 70 $ à 360 $, et les paliers signifient à peu près ceci :</p>

<table>
<thead>
<tr><th>Fourchette</th><th>Ce que cela exprime</th><th>Convient à</th></tr>
</thead>
<tbody>
<tr><td>70 $ – 110 $</td><td>Attentionné, sans chichi, ne crée aucune obligation</td><td>Cadeaux d'hôte, collègues, remerciements, une amie qui traverse une semaine difficile</td></tr>
<tr><td>130 $ – 200 $</td><td>Un vrai cadeau, manifestement choisi</td><td>Anniversaires, parents, amis proches, clients clés</td></tr>
<tr><td>250 $ – 360 $</td><td>Une occasion en soi</td><td>Grands anniversaires de mariage, remerciement important, un conjoint</td></tr>
</tbody>
</table>

<p>Une chose mérite d'être nommée : dépenser bien au-delà de la relation peut se retourner contre vous. Un cadeau nettement plus généreux que prévu peut laisser au destinataire le sentiment de vous devoir quelque chose, soit l'inverse de l'effet recherché. Le palier doit correspondre à la relation, pas à votre budget.</p>

<h2>À partager ou personnel : décidez délibérément</h2>

<p>C'est la distinction que l'on rate le plus souvent, et elle est facile à réussir.</p>

<p><strong>À partager</strong> signifie beaucoup de petits articles, idéalement emballés individuellement : collations, chocolats, biscuits, café. Cela survit à une ouverture devant une salle. Personne ne se sent mal à l'aise d'en prendre un.</p>

<p><strong>Personnel</strong> signifie moins d'articles, mais meilleurs, destinés à une seule personne : soins, parfum, un bel objet unique. C'est un cadeau chaleureux à ouvrir seul et embarrassant à ouvrir à un bureau sous le regard des collègues.</p>

<p>Quand vous ignorez vraiment la situation, « à partager » est le choix le plus sûr. Un panier <a href="/fr/category/gourmet">gourmet et collations</a> est presque impossible à rater ; un coffret de spa peut l'être, dans la mauvaise pièce.</p>

<h2>Avant de commander : les restrictions alimentaires</h2>

<p>Les cadeaux alimentaires comportent un risque réel que les fleurs et les bougies n'ont pas. Si vous connaissez une allergie, une restriction alimentaire ou un changement de santé récent, cela doit primer sur toute autre considération de ce guide, y compris l'apparence du panier.</p>

<p>Si vous n'êtes pas certain, <a href="/fr/contact">demandez-nous</a> ce que contient un panier avant de commander plutôt que d'espérer. Nos paniers sont assemblés à la main après la commande : nous pouvons vous dire exactement ce qu'un panier donné contient. Si la réponse l'exclut, <a href="/fr/category/spa-wellness">spa et bien-être</a> contourne entièrement la question.</p>

<p>Autre point : nous ne vendons aucun alcool. Pour certains destinataires, c'est un fait neutre ; pour d'autres, c'est précisément pourquoi un panier est le bon choix.</p>

<h2>Quand les fleurs fraîches sont un mauvais choix</h2>

<p>Plusieurs de nos paniers sont construits autour de fleurs fraîches, et ce sont les plus spectaculaires que nous réalisons. Ce sont aussi les plus circonstanciels.</p>

<p><strong>Les fleurs conviennent</strong> quand le cadeau va à un domicile, qu'il sera reçu par quelqu'un de présent, et que le moment est festif ou affectueux.</p>

<p><strong>Les fleurs ne conviennent pas</strong> quand le destinataire est dans un hôpital qui les restreint, quand le cadeau arrive dans un bureau où il devient la corvée d'arrosage de quelqu'un, quand personne ne sera là pour le recevoir, ou quand l'adresse est hors de notre zone de livraison locale. Les fleurs fraîches ne voyagent pas par messager : les paniers fleuris sont donc réservés à la livraison locale et à la cueillette. Tout ce qui ne peut être expédié est indiqué sur sa fiche produit, et la caisse vous prévient avant le paiement.</p>

<h2>Par destinataire</h2>

<h3>Un conjoint</h3>

<p>Le seul cas où le personnel l'emporte sans discussion, et où le palier peut se situer plus haut que d'habitude. Fleurs, chocolat et soins ensemble forment la combinaison classique, et ce n'est pas un hasard. Voir <a href="/fr/recipients/couples">couples</a>.</p>

<h3>Un parent</h3>

<p>Le réconfort passe mieux que le luxe. Café, thé, de quoi s'asseoir un moment : ce qui transforme un matin ordinaire en moment choisi. Évitez tout ce qui demande un apprentissage ou une installation. Voir <a href="/fr/category/coffee-tea">café et thé</a>.</p>

<h3>Un ami proche</h3>

<p>Vous en savez assez pour être précis : soyez précis. C'est le destinataire pour qui la carte compte autant que le panier. Voir <a href="/fr/guides/what-to-write-in-a-gift-message">quoi écrire sur une carte-cadeau</a>. Voir <a href="/fr/recipients/a-friend">pour un ami</a>.</p>

<h3>Quelqu'un qui traverse une épreuve</h3>

<p>Envoyez des choses qui n'exigent rien. Aucun assemblage, aucune décision, aucune réponse attendue. Nourriture réconfortante, thé, quelque chose de doux. N'envoyez rien qui doive être traité aujourd'hui. Voir <a href="/fr/occasions/thinking-of-you">je pense à toi</a> et <a href="/fr/occasions/get-well">prompt rétablissement</a>.</p>

<h3>Un collègue ou une équipe</h3>

<p>À partager, sans hésitation. La variété avant le raffinement, rien qui suppose une intimité, rien à réfrigérer dans une cuisine de bureau. Voir <a href="/fr/recipients/employees">pour les employés</a>.</p>

<h3>Un client</h3>

<p>À partager également : la plupart des cadeaux aux clients sont ouverts dans un espace commun. Gardez la carte exempte de tout ce qui ressemble à un message de vente. Le <a href="/fr/guides/corporate-gifting-ontario-cra-rules-budgets-timing">guide des cadeaux d'affaires</a> traite des budgets, du traitement fiscal et de la livraison multi-adresses. Voir <a href="/fr/recipients/clients">pour les clients</a>.</p>

<h3>Tout un foyer</h3>

<p>Présumez que ce sera partagé. Sucré et salé ensemble rejoignent plus de monde que l'un ou l'autre seul. Voir <a href="/fr/recipients/family">pour la famille</a>.</p>

<h3>Quand vous la connaissez à peine</h3>

<p>Une nouvelle voisine, l'adjointe d'un client, quelqu'un qui vous rend un service professionnel. Optez pour du longue conservation, à partager, de gamme moyenne. De la chaleur sans présomption, voilà tout le mandat. Voir <a href="/fr/occasions/thank-you">merci</a>.</p>

<h2>Trois choses à éviter</h2>

<ol>
<li><strong>Un cadeau qui crée une tâche.</strong> Tout ce qui exige un vase, un réfrigérateur, un assemblage ou une décision à l'arrivée est du travail remis dans un bel emballage.</li>
<li><strong>Deviner les restrictions alimentaires.</strong> Demandez, ou choisissez quelque chose qui évite la question.</li>
<li><strong>Attendre la veille.</strong> Les paniers sont assemblés après la commande, et une commande passée après l'heure limite quotidienne démarre le lendemain. La <a href="/fr/delivery">livraison le jour même</a> est offerte dans une bonne partie du Grand Toronto, mais cela dépend de l'adresse et de l'heure limite. Le <a href="/fr/guides/ontario-gifting-calendar-thanksgiving-to-holidays">calendrier des cadeaux</a> explique comment fonctionnent les délais.</li>
</ol>

<p>Encore indécis ? <a href="/fr/baskets">Parcourez tout</a>, ou affinez par <a href="/fr/recipients/for-her">pour elle</a>, <a href="/fr/recipients/for-him">pour lui</a>, ou <a href="/fr/category/chocolate">chocolat</a>.</p>`,
  },
};

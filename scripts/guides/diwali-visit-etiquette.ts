import type { GuideSeed } from "./types";

/**
 * Deliberately not a second "Diwali gift hampers" page: `diwali-gift-hampers-gta`
 * already targets that, and two pages on one query compete with each other.
 * This one answers the guest's question instead ("what to bring to a Diwali
 * party", "Diwali etiquette for guests"), which is a different search, often
 * from someone who does not celebrate and has been invited by a colleague,
 * neighbour or partner's family. It links to the hamper guide for the rest.
 *
 * Same cultural care as the hamper guide: keep to what is broadly true across
 * families, hedge where practice varies, and do not lecture people about their
 * own festival. Mithai and dry fruit come from local shops; the guide says so.
 *
 * Diwali 2026 is Sunday 8 November. Update the date each autumn in both
 * locales, alongside the hamper guide.
 */
export const diwaliVisitEtiquette: GuideSeed = {
  slug: "what-to-bring-to-a-diwali-celebration",
  category: "ETIQUETTE",
  readMinutes: 5,
  featured: false,
  title: {
    en: "Invited for Diwali? What to bring, and how to be a good guest",
    fr: "Invité pour Diwali? Quoi apporter et comment être un bon invité",
  },
  excerpt: {
    en: "Invited to a Diwali celebration and not sure what to bring? The gifts that are always welcome, the ones to skip, and the small courtesies that make a first Diwali visit easy for guest and host alike.",
    fr: "Invité à une fête de Diwali sans savoir quoi apporter? Les cadeaux toujours bienvenus, ceux à éviter et les petites politesses qui rendent une première visite de Diwali facile pour l'invité comme pour l'hôte.",
  },
  seoTitle: {
    en: "What to Bring to a Diwali Party: A Guest's Guide",
    fr: "Quoi apporter à une fête de Diwali : le guide de l'invité",
  },
  seoDescription: {
    en: "What to bring when you are invited for Diwali: sweets, dry fruit, chocolate and gift baskets, what to avoid, and simple etiquette for guests visiting a Diwali home in the GTA.",
    fr: "Quoi apporter quand on est invité pour Diwali : sucreries, fruits secs, chocolat et paniers-cadeaux, ce qu'il faut éviter, et l'étiquette simple pour les invités dans le Grand Toronto.",
  },
  body: {
    en: `<p>Diwali is a festival of visiting. Families open their homes, friends drop by with sweets, and across Mississauga and Brampton plenty of people who do not celebrate it themselves get their first invitation from a colleague, a neighbour or a partner's family. If that is you, being asked is a compliment. The question that usually follows is what to bring.</p>

<p>In 2026, Diwali falls on <strong>Sunday 8 November</strong>, and celebrations and visits often run across several days around it. Sikh families mark Bandi Chhor Divas on the same day.</p>

<h2>Do bring something</h2>

<p>Arriving with a gift is part of a Diwali visit. It does not need to be expensive. It does need to be shareable, because whatever you bring is likely to be opened and offered round to the other guests, or passed on to the next house the family visits.</p>

<h2>Gifts that are always welcome</h2>

<p>A box of sweets is the classic. Mithai, such as kaju katli, barfi or ladoo, should come from a well-regarded local sweet shop, and your host will probably know which one. Dry fruits and nuts are a long-standing alternative: a box of almonds, cashews, pistachios and dates keeps well, which a household receiving a lot of fresh sweets will appreciate.</p>

<p>Boxed chocolate has become a Diwali standard in its own right across the GTA, and a <a href="/category/chocolate">chocolate gift basket</a> is easy to share and sits comfortably beside the mithai. Since Diwali is the festival of lights, candles, diyas or a small decorative piece for the home also fit the occasion. A gift basket with chocolate, biscuits, <a href="/category/coffee-tea">tea or coffee</a> and treats covers several of these at once, and it arrives already wrapped. See our <a href="/occasions/diwali">Diwali gift baskets</a>.</p>

<h2>What to skip</h2>

<ul>
<li>Alcohol, unless you know for certain. Plenty of households that celebrate Diwali do not drink, and in many it would be out of place at a religious festival. If you are not sure, leave it out. Velvéa sells no alcohol, so nothing in our baskets raises the question.</li>
<li>Anything with meat, gelatine or egg for a vegetarian home. Many Diwali households are vegetarian, and some are strict about it. Gummies and marshmallows usually contain gelatine, and Jain families avoid a longer list of ingredients. When in doubt, ask your host or choose something clearly vegetarian, and <a href="/contact">ask us what a basket contains</a> before you order.</li>
<li>A dish to serve that evening. A host feeding a full house does not need another plate to manage. Bring something that can be put aside and enjoyed later.</li>
</ul>

<h2>Being a good guest</h2>

<ul>
<li><strong>Greet with "Happy Diwali".</strong> It is always right, from anyone. "Shubh Deepavali" is a warm alternative if you would like to try it.</li>
<li><strong>Check the time.</strong> The evening of Diwali often includes Lakshmi Puja, a family prayer. Arrive when you were invited. If you are dropping by unannounced, the days around Diwali are usually easier than the evening itself.</li>
<li><strong>Expect to take your shoes off.</strong> Many homes ask guests to remove their shoes at the door, so wear socks you are happy to be seen in.</li>
<li><strong>Dress up a little.</strong> Diwali is festive and people dress for it. You do not need traditional clothing, but something brighter than everyday wear is a nice touch.</li>
<li><strong>Accept what is offered.</strong> You will almost certainly be offered sweets and snacks, and probably a meal. Taking at least a little is part of the hospitality.</li>
<li><strong>Do not be surprised by fireworks.</strong> Sparklers and fireworks are part of many family celebrations. If you are the one bringing them, check your city's bylaws first.</li>
</ul>

<h2>If you cannot visit in person</h2>

<p>Sending a gift ahead of the day is a warm alternative, and in the GTA it is common practice. Aim for it to arrive in the days before Diwali, not on the night, when the family is likely to be at the temple, gurdwara or out visiting. Our <a href="/guides/diwali-gift-hampers-gta">Diwali gift hampers guide</a> covers delivery timing, sending gifts to family and clients, and what to write on the card.</p>

<p>Nobody expects a first-time guest to know every custom. Turn up with something to share at the hour you were given, and the rest tends to follow. Our <a href="/occasions/diwali">Diwali gift baskets</a> make the first part easy, and if you want help with the card, see <a href="/guides/what-to-write-in-a-gift-message">what to write in a gift message</a>.</p>`,

    fr: `<p>Diwali est une fête de visites. Les familles ouvrent leur maison, les amis passent avec des sucreries, et à Mississauga et à Brampton, bien des gens qui ne la célèbrent pas reçoivent leur première invitation d'un collègue, d'un voisin ou de la famille d'un partenaire. Si c'est votre cas, l'invitation est une marque d'amitié. Reste la question qui suit presque toujours : qu'est-ce que j'apporte?</p>

<p>En 2026, Diwali tombe le <strong>dimanche 8 novembre</strong>, et les célébrations et les visites s'étalent souvent sur plusieurs jours autour de cette date. Les familles sikhes soulignent Bandi Chhor Divas le même jour.</p>

<h2>Apportez quelque chose</h2>

<p>Arriver avec un cadeau fait partie d'une visite de Diwali. Il n'a pas besoin d'être coûteux. Il doit en revanche pouvoir se partager, car ce que vous apportez sera sans doute ouvert et offert aux autres invités, ou apporté à la prochaine maison que la famille visitera.</p>

<h2>Les cadeaux toujours bienvenus</h2>

<p>La boîte de sucreries est le grand classique. Les mithai, comme le kaju katli, la barfi ou les ladoo, s'achètent dans une confiserie locale réputée, et votre hôte saura probablement laquelle. Les fruits secs et les noix sont une option de longue date : une boîte d'amandes, de noix de cajou, de pistaches et de dattes se conserve bien, ce qu'apprécie une maison qui reçoit beaucoup de sucreries fraîches.</p>

<p>La boîte de chocolats est devenue un classique de Diwali à part entière dans le Grand Toronto, et un <a href="/fr/category/chocolate">panier-cadeau de chocolat</a> se partage facilement et trouve naturellement sa place à côté des mithai. Comme Diwali est la fête des lumières, des bougies, des diyas ou un petit objet décoratif pour la maison conviennent aussi à l'occasion. Un panier-cadeau de chocolat, de biscuits, de <a href="/fr/category/coffee-tea">thé ou de café</a> et de gâteries réunit plusieurs de ces idées à la fois, et il arrive déjà emballé. Voyez nos <a href="/fr/occasions/diwali">paniers-cadeaux de Diwali</a>.</p>

<h2>Ce qu'il vaut mieux éviter</h2>

<ul>
<li>L'alcool, sauf si vous en êtes certain. Bien des foyers qui célèbrent Diwali ne boivent pas, et dans beaucoup d'entre eux l'alcool serait déplacé lors d'une fête religieuse. Dans le doute, abstenez-vous. Velvéa ne vend pas d'alcool, donc rien dans nos paniers ne pose la question.</li>
<li>Tout ce qui contient viande, gélatine ou œuf pour un foyer végétarien. Beaucoup de foyers qui célèbrent Diwali sont végétariens, certains strictement. Les jujubes et les guimauves contiennent généralement de la gélatine, et les familles jaïnes évitent une liste d'ingrédients plus longue. Dans le doute, demandez à votre hôte ou choisissez quelque chose de clairement végétarien, et <a href="/fr/contact">demandez-nous ce que contient un panier</a> avant de commander.</li>
<li>Un plat à servir le soir même. Un hôte qui nourrit une maison pleine n'a pas besoin d'un plat de plus à gérer. Apportez quelque chose qui peut être mis de côté et savouré plus tard.</li>
</ul>

<h2>Être un bon invité</h2>

<ul>
<li><strong>Saluez d'un « Joyeux Diwali ».</strong> C'est toujours juste, de la part de n'importe qui. « Shubh Deepavali » est une belle variante si vous voulez l'essayer.</li>
<li><strong>Respectez l'heure.</strong> Le soir de Diwali comprend souvent la Lakshmi Puja, une prière en famille. Arrivez à l'heure convenue. Si vous passez à l'improviste, les jours autour de Diwali sont généralement plus faciles que la soirée elle-même.</li>
<li><strong>Attendez-vous à retirer vos chaussures.</strong> Beaucoup de maisons demandent aux invités de se déchausser à l'entrée, alors portez des bas présentables.</li>
<li><strong>Mettez-vous un peu sur votre trente-et-un.</strong> Diwali est une fête et on s'habille pour l'occasion. Pas besoin de vêtements traditionnels, mais une tenue plus colorée qu'au quotidien fait plaisir.</li>
<li><strong>Acceptez ce qu'on vous offre.</strong> On vous proposera presque certainement des sucreries et des collations, et probablement un repas. En prendre au moins un peu fait partie de l'hospitalité.</li>
<li><strong>Ne soyez pas surpris par les feux d'artifice.</strong> Les cierges magiques et les feux d'artifice font partie de bien des célébrations familiales. Si c'est vous qui les apportez, vérifiez d'abord les règlements de votre ville.</li>
</ul>

<h2>Si vous ne pouvez pas vous déplacer</h2>

<p>Envoyer un cadeau avant le jour est une belle solution de rechange, et c'est une pratique courante dans le Grand Toronto. Visez une arrivée dans les jours qui précèdent Diwali, pas le soir même, quand la famille sera sans doute au temple, au gurdwara ou en visite. Notre <a href="/fr/guides/diwali-gift-hampers-gta">guide des paniers-cadeaux de Diwali</a> couvre les délais de livraison, les cadeaux à la famille et aux clients, et quoi écrire sur la carte.</p>

<p>Personne n'attend d'un invité qui en est à sa première fois qu'il connaisse toutes les coutumes. Présentez-vous à l'heure convenue avec quelque chose à partager, et le reste suit généralement. Nos <a href="/fr/occasions/diwali">paniers-cadeaux de Diwali</a> règlent la première partie, et pour la carte, consultez <a href="/fr/guides/what-to-write-in-a-gift-message">quoi écrire dans un message de cadeau</a>.</p>`,
  },
};

import type { GuideSeed } from "./types";

/**
 * The evergreen local-search guide: "same day gift delivery Mississauga",
 * "gift basket delivery Toronto today", "gift delivery Brampton / Oakville".
 * The last-minute Christmas guide answers the same question with December
 * dates and goes stale in January; `velvea-gift-hampers-gta` is the brand
 * story. This one is the year-round how-it-works page, and it links to every
 * city page under /delivery so those get internal links from the guides.
 *
 * UNLIKE MOST GUIDES, THIS ONE QUOTES FEES. A delivery guide without the cost
 * does not answer the search. Every figure was read from the live
 * `DeliveryZone` rows on 23 Nov 2026:
 *   local-a (Mississauga)        $9.99  + $5.00 same-day, cutoff 12:00
 *   local-b / -west / -york      $14.99 + $7.00 same-day, cutoff 12:00
 *   local-c (Durham, north GTA)  $19.99, next day at the earliest
 *   on-ground                    from $31.99, 2-4 business days
 *   pickup                       free
 * If the owner edits a zone in admin, edit the table and the prose here in
 * both locales and re-run the seeder with `--write --force`. The city pages
 * read the zones live and need nothing.
 *
 * Other rules stated, all business decisions of 3-4 Nov 2026: noon same-day
 * cutoff, fresh flowers two days, three or more baskets two days, more than
 * ten by quote, a daily cap on local deliveries. The weekday 7-11 pm window
 * matches the other guides and is still on the owner's "confirm" list in
 * docs/LAUNCH-CHECKLIST.md.
 *
 * Nothing is promised about what happens when nobody answers the door: there
 * is no written policy to quote. The guide only asks for a phone number and
 * access details, which is what makes the problem rare.
 */
export const sameDayDeliveryGta: GuideSeed = {
  slug: "same-day-gift-delivery-mississauga-toronto-gta",
  category: "OCCASIONS",
  readMinutes: 6,
  featured: false,
  title: {
    en: "Same-day gift delivery in Mississauga, Toronto and the GTA: how it works and what it costs",
    fr: "Livraison de cadeaux le jour même à Mississauga, à Toronto et dans le Grand Toronto : fonctionnement et frais",
  },
  excerpt: {
    en: "Order before noon and a gift basket can reach a door in Mississauga, Toronto, Brampton, Oakville or Vaughan today. The cutoff, the delivery fee for each city, what cannot go the same day, and what to do once noon has passed.",
    fr: "Commandez avant midi et un panier-cadeau peut arriver aujourd'hui à Mississauga, à Toronto, à Brampton, à Oakville ou à Vaughan. L'heure limite, les frais de livraison par ville, ce qui ne peut pas partir le jour même et quoi faire une fois midi passé.",
  },
  seoTitle: {
    en: "Same-Day Gift Delivery in Mississauga, Toronto and the GTA",
    fr: "Livraison de cadeaux le jour même à Mississauga et Toronto",
  },
  seoDescription: {
    en: "Same-day gift basket delivery in Mississauga, Toronto, Brampton, Oakville, Vaughan and the GTA: order by noon, fees by city, what cannot go same-day, plus free pickup in Mississauga.",
    fr: "Livraison de paniers-cadeaux le jour même à Mississauga, Toronto, Brampton, Oakville, Vaughan et dans le Grand Toronto : commande avant midi, frais par ville, exceptions, et ramassage gratuit à Mississauga.",
  },
  body: {
    en: `<p>It is half past ten on a Tuesday and your phone has just reminded you that it is your sister's birthday. Or a colleague's father has died, or a friend came home from hospital last night, or the house your clients bought closes this afternoon. The gift has to arrive today, and you are at your desk.</p>

<p>This is what same-day delivery is for. We pack every basket in our studio in Mississauga and deliver across the GTA with our own drivers, not a courier, which is why an order placed in the morning can be at a door by the evening. Here is how it works, city by city.</p>

<h2>The short answer</h2>

<ul>
<li>Order before noon Eastern for delivery the same day. After noon, the earliest is the next day.</li>
<li>Same-day covers Mississauga, Toronto, Brampton, Oakville, Milton, Burlington, Georgetown, Bolton, Vaughan, Markham and Richmond Hill.</li>
<li>Durham Region and the north GTA are delivered from the next day.</li>
<li>Bouquets, baskets with fresh flowers and orders of three or more baskets need two days.</li>
<li>Pickup from our studio in Mississauga is free.</li>
</ul>

<h2>Where we deliver, and what it costs</h2>

<p>Local delivery is a flat fee per order, set by the postal code it is going to. Same-day adds a small surcharge, because it means a driver goes out for that order today.</p>

<table>
<thead>
<tr><th>Area</th><th>Earliest delivery</th><th>Delivery fee</th><th>Same-day adds</th></tr>
</thead>
<tbody>
<tr><td>Mississauga, including Malton</td><td>Today, if ordered by noon</td><td>$9.99</td><td>$5.00</td></tr>
<tr><td>Toronto, including Etobicoke, North York and Scarborough</td><td>Today, if ordered by noon</td><td>$14.99</td><td>$7.00</td></tr>
<tr><td>Brampton, Oakville, Milton, Burlington, Georgetown and Bolton</td><td>Today, if ordered by noon</td><td>$14.99</td><td>$7.00</td></tr>
<tr><td>Vaughan, Markham and Richmond Hill</td><td>Today, if ordered by noon</td><td>$14.99</td><td>$7.00</td></tr>
<tr><td>Durham Region and the north GTA (Pickering, Ajax, Whitby, Oshawa, Newmarket, Aurora, Stouffville, Caledon)</td><td>Next day</td><td>$19.99</td><td>Not offered</td></tr>
</tbody>
</table>

<p>Areas are decided by postal code, not by the city name on the envelope, so the edges do not always fall where you would expect. Enter the recipient's postal code at checkout and you will see the days that are open and the exact fee before you pay.</p>

<p>Each city also has its own page with the neighbourhoods we cover: <a href="/delivery/mississauga">Mississauga</a>, <a href="/delivery/malton">Malton</a>, <a href="/delivery/toronto">Toronto</a>, <a href="/delivery/etobicoke">Etobicoke</a>, <a href="/delivery/brampton">Brampton</a>, <a href="/delivery/oakville">Oakville</a>, <a href="/delivery/milton">Milton</a>, <a href="/delivery/burlington">Burlington</a>, <a href="/delivery/georgetown">Georgetown</a>, <a href="/delivery/bolton">Bolton</a>, <a href="/delivery/vaughan">Vaughan</a>, <a href="/delivery/markham">Markham</a> and <a href="/delivery/richmond-hill">Richmond Hill</a>.</p>

<h2>When it arrives</h2>

<p>On a weekday, same-day orders are delivered in the evening, between 7 and 11 pm. That is deliberate. Most gifts go to a home, and the evening is when somebody is there to open the door. On Saturdays and Sundays we deliver through the day.</p>

<p>The evening window matters if the gift is meant for a workplace. An office, a clinic or a school will usually be closed by the time a weekday delivery arrives, so send it to the person's home, choose a weekend date, or collect it from us and bring it in yourself.</p>

<h2>What cannot go the same day</h2>

<p>Fresh flowers need two days' notice, so bouquets and the baskets that include them cannot go out today. An order of three or more baskets also needs two days, because each one is packed by hand. For more than ten, <a href="/corporate/quote">ask for a quote</a> and we will tell you which date is realistic.</p>

<p>Custom gifts work to their own timetable too, since we send a price and wait for your approval before making anything. If today is the day, choose from the baskets on the site. The product page shows how soon each one can be ready.</p>

<h2>Busy days fill up</h2>

<p>We take a limited number of local deliveries a day, so that every basket is packed properly and arrives when we said it would. When a day is full, checkout offers the next open one. Around Mother's Day, Valentine's Day, Diwali and the week before Christmas, that can happen by mid-morning.</p>

<p>If you already know the date, there is no reason to wait for it. Checkout lets you choose the delivery day, so a gift for the 14th can be ordered on the 3rd. Same-day is there for the occasion you forgot. For the one you remembered, book ahead.</p>

<h2>Help the driver reach the door</h2>

<p>Most delivery problems in the GTA are access problems, and they are solved in the delivery notes at checkout. Three lines make the difference.</p>

<p>First, the recipient's phone number, so the driver can call from downstairs. Second, for a condo or apartment, the buzzer code and unit number, and whether the concierge can accept a delivery if the person is out. A large share of Toronto and Mississauga City Centre addresses are towers, and "Unit 2104, buzzer 2104, concierge OK" saves twenty minutes at the door. Third, for a house, anything unusual about finding it: a side entrance, a basement unit, a gate.</p>

<p>If it is a surprise, you do not have to spoil it. Telling the person to keep their phone nearby that evening is enough. For a hospital or care home, check the rules first. Our <a href="/guides/get-well-gift-ideas-after-surgery-illness">get well guide</a> explains what wards usually restrict.</p>

<h2>If noon has already passed</h2>

<p>You have two options. The first is next-day delivery, which costs the standard fee without the same-day surcharge. A card that says "a day late, and I am sorry" is forgiven faster than you think.</p>

<p>The second is pickup. Orders can be collected free from our studio at 5105 Hurontario Street in Mississauga, a few minutes from Square One, and checkout shows the earliest time yours can be ready. If you will see the person tonight anyway, this is often the quickest way to have a gift in your hands.</p>

<h2>Outside the GTA</h2>

<p>Gifts for Hamilton, Guelph, Ottawa, London and the rest of Ontario travel by tracked courier, usually in two to four business days, from $37.99. We also ship to Quebec, the Prairies, British Columbia and the Atlantic provinces. Baskets with fresh items or a lot of chocolate stay local, and each product page says whether it can be shipped. Details are on the <a href="/shipping">shipping page</a>.</p>

<h2>What to send at short notice</h2>

<p>When there is no time to think, choose by household. Something to share suits a family: a <a href="/category/gourmet">gourmet</a> or <a href="/category/chocolate">chocolate</a> basket. <a href="/category/coffee-tea">Coffee and tea</a> is the safest choice for someone you do not know well. A <a href="/category/spa-wellness">spa basket</a> suits the person who has had a hard month. Nothing we sell contains alcohol, so any of them can go to any door.</p>

<p>For the two occasions that get forgotten most, the <a href="/occasions/birthday">birthday</a> and <a href="/occasions/anniversary">anniversary</a> collections are the place to start. And since a late gift leans on its card, read <a href="/guides/how-to-make-a-birthday-gift-special">how to make a birthday gift special</a> or <a href="/guides/anniversary-surprise-ideas-personalised-gift">how to plan an anniversary surprise</a> before you write it.</p>`,
    fr: `<p>Il est dix heures et demie un mardi, et votre téléphone vient de vous rappeler que c'est la fête de votre sœur. Ou le père d'un collègue est décédé, ou une amie est rentrée de l'hôpital hier soir, ou la maison de vos clients change de mains cet après-midi. Le cadeau doit arriver aujourd'hui, et vous êtes à votre bureau.</p>

<p>C'est à cela que sert la livraison le jour même. Nous emballons chaque panier dans notre atelier de Mississauga et nous livrons dans le Grand Toronto avec nos propres livreurs, pas un transporteur. C'est ce qui permet à une commande passée le matin d'être à une porte le soir. Voici comment cela fonctionne, ville par ville.</p>

<h2>La réponse courte</h2>

<ul>
<li>Commandez avant midi, heure de l'Est, pour une livraison le jour même. Après midi, c'est le lendemain au plus tôt.</li>
<li>Le jour même couvre Mississauga, Toronto, Brampton, Oakville, Milton, Burlington, Georgetown, Bolton, Vaughan, Markham et Richmond Hill.</li>
<li>La région de Durham et le nord du Grand Toronto sont livrés à partir du lendemain.</li>
<li>Les bouquets, les paniers avec des fleurs fraîches et les commandes de trois paniers ou plus demandent deux jours.</li>
<li>Le ramassage à notre atelier de Mississauga est gratuit.</li>
</ul>

<h2>Où nous livrons, et à quel prix</h2>

<p>La livraison locale est un montant fixe par commande, établi selon le code postal de destination. Le jour même ajoute un petit supplément, parce qu'un livreur part aujourd'hui pour cette commande.</p>

<table>
<thead>
<tr><th>Secteur</th><th>Livraison au plus tôt</th><th>Frais de livraison</th><th>Supplément jour même</th></tr>
</thead>
<tbody>
<tr><td>Mississauga, y compris Malton</td><td>Aujourd'hui, si commandé avant midi</td><td>9,99 $</td><td>5,00 $</td></tr>
<tr><td>Toronto, y compris Etobicoke, North York et Scarborough</td><td>Aujourd'hui, si commandé avant midi</td><td>14,99 $</td><td>7,00 $</td></tr>
<tr><td>Brampton, Oakville, Milton, Burlington, Georgetown et Bolton</td><td>Aujourd'hui, si commandé avant midi</td><td>14,99 $</td><td>7,00 $</td></tr>
<tr><td>Vaughan, Markham et Richmond Hill</td><td>Aujourd'hui, si commandé avant midi</td><td>14,99 $</td><td>7,00 $</td></tr>
<tr><td>Région de Durham et nord du Grand Toronto (Pickering, Ajax, Whitby, Oshawa, Newmarket, Aurora, Stouffville, Caledon)</td><td>Le lendemain</td><td>19,99 $</td><td>Non offert</td></tr>
</tbody>
</table>

<p>Les secteurs sont définis par le code postal, pas par le nom de la ville sur l'enveloppe, et les limites ne tombent donc pas toujours où on les attend. Entrez le code postal du destinataire à la caisse : vous verrez les journées ouvertes et les frais exacts avant de payer.</p>

<p>Chaque ville a aussi sa propre page, avec les quartiers desservis : <a href="/fr/delivery/mississauga">Mississauga</a>, <a href="/fr/delivery/malton">Malton</a>, <a href="/fr/delivery/toronto">Toronto</a>, <a href="/fr/delivery/etobicoke">Etobicoke</a>, <a href="/fr/delivery/brampton">Brampton</a>, <a href="/fr/delivery/oakville">Oakville</a>, <a href="/fr/delivery/milton">Milton</a>, <a href="/fr/delivery/burlington">Burlington</a>, <a href="/fr/delivery/georgetown">Georgetown</a>, <a href="/fr/delivery/bolton">Bolton</a>, <a href="/fr/delivery/vaughan">Vaughan</a>, <a href="/fr/delivery/markham">Markham</a> et <a href="/fr/delivery/richmond-hill">Richmond Hill</a>.</p>

<h2>Quand le cadeau arrive</h2>

<p>En semaine, les commandes du jour même sont livrées en soirée, entre 19 h et 23 h. C'est voulu. La plupart des cadeaux vont à une résidence, et c'est le soir qu'il y a quelqu'un pour ouvrir la porte. Le samedi et le dimanche, nous livrons tout au long de la journée.</p>

<p>Cette plage du soir compte si le cadeau est destiné à un lieu de travail. Un bureau, une clinique ou une école seront le plus souvent fermés à l'heure d'une livraison en semaine. Envoyez-le donc au domicile de la personne, choisissez une date de fin de semaine, ou venez le chercher et apportez-le vous-même.</p>

<h2>Ce qui ne peut pas partir le jour même</h2>

<p>Les fleurs fraîches demandent un préavis de deux jours, alors les bouquets et les paniers qui en contiennent ne peuvent pas partir aujourd'hui. Une commande de trois paniers ou plus demande aussi deux jours, parce que chacun est emballé à la main. Au-delà de dix, <a href="/fr/corporate/quote">demandez une soumission</a> et nous vous dirons quelle date est réaliste.</p>

<p>Les cadeaux sur mesure suivent aussi leur propre calendrier, puisque nous envoyons un prix et attendons votre accord avant de fabriquer quoi que ce soit. Si c'est pour aujourd'hui, choisissez parmi les paniers du site. La page de chaque produit indique dans quel délai il peut être prêt.</p>

<h2>Les grosses journées se remplissent</h2>

<p>Nous acceptons un nombre limité de livraisons locales par jour, pour que chaque panier soit bien emballé et arrive au moment annoncé. Quand une journée est complète, la caisse propose la suivante. Autour de la fête des Mères, de la Saint-Valentin, de Diwali et dans la semaine avant Noël, cela peut arriver dès le milieu de la matinée.</p>

<p>Si vous connaissez déjà la date, rien ne sert de l'attendre. La caisse vous laisse choisir le jour de livraison, et un cadeau pour le 14 peut donc se commander le 3. Le jour même existe pour l'occasion que vous avez oubliée. Pour celle dont vous vous êtes souvenu, réservez d'avance.</p>

<h2>Aidez le livreur à se rendre à la porte</h2>

<p>Dans le Grand Toronto, la plupart des problèmes de livraison sont des problèmes d'accès, et ils se règlent dans les notes de livraison à la caisse. Trois lignes font la différence.</p>

<p>D'abord, le numéro de téléphone du destinataire, pour que le livreur puisse appeler d'en bas. Ensuite, pour un condo ou un appartement, le code de l'interphone et le numéro d'unité, et si le concierge peut accepter une livraison en cas d'absence. Une bonne part des adresses de Toronto et du centre-ville de Mississauga sont des tours, et « Unité 2104, interphone 2104, concierge OK » épargne vingt minutes à la porte. Enfin, pour une maison, tout ce qui sort de l'ordinaire pour la trouver : une entrée de côté, un logement au sous-sol, une barrière.</p>

<p>Si c'est une surprise, vous n'avez pas à la gâcher. Dire à la personne de garder son téléphone près d'elle ce soir-là suffit. Pour un hôpital ou une résidence de soins, vérifiez d'abord les règles. Notre <a href="/fr/guides/get-well-gift-ideas-after-surgery-illness">guide des cadeaux de prompt rétablissement</a> explique ce que les unités restreignent le plus souvent.</p>

<h2>Si midi est déjà passé</h2>

<p>Vous avez deux options. La première est la livraison le lendemain, aux frais habituels, sans le supplément du jour même. Une carte qui dit « avec un jour de retard, et toutes mes excuses » se fait pardonner plus vite qu'on ne le pense.</p>

<p>La seconde est le ramassage. Les commandes peuvent être récupérées gratuitement à notre atelier du 5105, rue Hurontario, à Mississauga, à quelques minutes de Square One, et la caisse indique l'heure la plus proche à laquelle la vôtre peut être prête. Si vous voyez la personne ce soir de toute façon, c'est souvent le moyen le plus rapide d'avoir un cadeau entre les mains.</p>

<h2>À l'extérieur du Grand Toronto</h2>

<p>Les cadeaux pour Hamilton, Guelph, Ottawa, London et le reste de l'Ontario voyagent par transporteur avec suivi, en général en deux à quatre jours ouvrables, à partir de 37,99 $. Nous expédions aussi au Québec, dans les Prairies, en Colombie-Britannique et dans les provinces de l'Atlantique. Les paniers qui contiennent des produits frais ou beaucoup de chocolat restent locaux, et la page de chaque produit indique s'il peut être expédié. Les détails sont sur la <a href="/fr/shipping">page d'expédition</a>.</p>

<h2>Quoi envoyer à la dernière minute</h2>

<p>Quand le temps manque pour réfléchir, choisissez selon le foyer. Quelque chose à partager convient à une famille : un panier <a href="/fr/category/gourmet">gourmet</a> ou de <a href="/fr/category/chocolate">chocolat</a>. Le <a href="/fr/category/coffee-tea">café et le thé</a> sont le choix le plus sûr pour quelqu'un que vous connaissez peu. Un <a href="/fr/category/spa-wellness">panier spa</a> convient à la personne qui vient de traverser un mois difficile. Rien de ce que nous vendons ne contient d'alcool, alors n'importe lequel peut aller à n'importe quelle porte.</p>

<p>Pour les deux occasions qu'on oublie le plus souvent, les collections d'<a href="/fr/occasions/birthday">anniversaire</a> et d'<a href="/fr/occasions/anniversary">anniversaire de mariage</a> sont le point de départ. Et comme un cadeau en retard s'appuie sur sa carte, lisez <a href="/fr/guides/how-to-make-a-birthday-gift-special">comment rendre un cadeau d'anniversaire spécial</a> ou <a href="/fr/guides/anniversary-surprise-ideas-personalised-gift">comment préparer une surprise d'anniversaire de mariage</a> avant de l'écrire.</p>`,
  },
};

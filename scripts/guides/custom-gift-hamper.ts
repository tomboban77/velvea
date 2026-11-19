import type { GuideSeed } from "./types";

/**
 * Companion to the "Custom styling" gallery (src/lib/gift-styles.ts). The
 * gallery can only say "pick a look and tell us what goes inside"; this is the
 * long answer to "tell you what, exactly?", so a request arrives with a main
 * gift, a budget and a date instead of "something nice".
 *
 * Constraints carried over from the gallery, keep them true when editing:
 * - The photos are design concepts. Every figure caption says so, and the text
 *   never promises a brand or an item shown in a picture.
 * - No turnaround or price is promised. The only lead time stated is the two
 *   days fresh flowers need, which the gallery note already commits to.
 * - Style names and codes (VS-01 to VS-05) match gift-styles.ts. If a style is
 *   renamed or retired there, update its section here.
 */
export const customGiftHamper: GuideSeed = {
  slug: "custom-gift-hamper-how-to-order",
  category: "OCCASIONS",
  readMinutes: 7,
  featured: false,
  title: {
    en: "Ordering a custom gift hamper: what to tell us so it comes out right",
    fr: "Commander un panier-cadeau sur mesure : quoi nous dire pour qu'il soit réussi",
  },
  excerpt: {
    en: "A custom gift goes wrong at the request, not at the wrapping. How to brief one in a few lines, why you should say your budget, what each of our five looks suits, and how fresh flowers change the timing.",
    fr: "Un cadeau sur mesure se rate à la demande, pas à l'emballage. Comment le décrire en quelques lignes, pourquoi dire votre budget, à quoi convient chacun de nos cinq styles, et ce que les fleurs fraîches changent au calendrier.",
  },
  seoTitle: {
    en: "Custom Gift Hampers: How to Order One That Comes Out Right",
    fr: "Panier-cadeau sur mesure : comment bien le commander",
  },
  seoDescription: {
    en: "How to order a custom gift hamper in the GTA: what to put in the request, how to set a budget, five presentation styles to start from, and the notice fresh flowers need. Price sent before anything is charged.",
    fr: "Comment commander un panier-cadeau sur mesure dans le Grand Toronto : quoi écrire dans la demande, comment fixer un budget, cinq styles de présentation et le préavis pour les fleurs fraîches. Prix envoyé avant toute facturation.",
  },
  body: {
    en: `<p>A ready-made basket is a guess made in advance, for nobody in particular. It works more often than you would think, because most people like good chocolate and a decent coffee. But sometimes you know one thing about a person that no catalogue could: the perfume she has worn for ten years, the photo from the trip in 2014, the fact that he would rather have one good wallet than nine small treats. That is when a custom gift earns the extra effort.</p>

<p>The effort is smaller than it sounds. With us it comes down to three steps. You pick a look, you tell us what should go inside, and we send you a price before anything is charged. This guide is about the middle step, because that is where a custom gift is won or lost.</p>

<h2>Start with one thing, not a list</h2>

<p>The requests that turn out best have a centre. One item that the person will recognise as chosen for them, and then a few smaller things that keep it company. A fragrance with chocolates and roses around it. A framed photograph with a wrapped gift beside it. A watch in a box that has been dressed for the occasion.</p>

<p>The requests that struggle are lists of twelve equal things. Twelve items at the same level read as a shopping bag, however well they are arranged, and the budget gets spread so thin that none of them is the good version. If you are stuck, ask yourself what you would hand over if you could only give one item. Build from there.</p>

<h2>What to put in the request</h2>

<p>You do not need to write much. Six or seven lines cover it:</p>

<ul>
<li>The occasion and the date it has to arrive.</li>
<li>Who it is for, in a sentence. "My wife, our tenth anniversary, she does not like anything too pink" tells us more than a paragraph of adjectives.</li>
<li>The main gift, as exactly as you can. Brand, name, size, shade. "Chanel Chance Eau Tendre, 50 mL" can be priced. "A nice perfume" cannot.</li>
<li>What to leave out. Allergies first, then dislikes: no nuts, no dark chocolate, nothing strongly scented.</li>
<li>Colours, if you care. Otherwise we follow the look you picked.</li>
<li>Your budget.</li>
<li>The postal code it is going to, so the delivery fee in the quote is the real one.</li>
</ul>

<p>If the card should say something specific, add that too. If you have not decided, <a href="/guides/what-to-write-in-a-gift-message">our guide to gift messages</a> has wording for most occasions.</p>

<h2>Say the budget</h2>

<p>People leave the budget blank because they think a number invites us to spend all of it. It does the opposite. Without a number we have to guess, and a guess is either too modest for the occasion or more than you wanted to pay. Either way the first quote is wasted and you lose time.</p>

<p>It also helps to know where the money goes. In most custom gifts the main item takes the largest share by a distance. A 50 mL bottle of a designer fragrance is often $100 or more in Canada before anything else is in the box. Fresh roses, the box or tray itself, the chocolates and the time to arrange it all come on top. So a budget of $150 with a designer perfume at the centre leaves very little for the rest, and it is better to hear that from us at the start than to be disappointed by the photo. Tell us the number and what matters most, and we will tell you plainly what fits.</p>

<h2>Five looks to start from</h2>

<p>Most people find it easier to point at a picture than to describe a presentation, so we keep five looks on the site. They are design concepts, not fixed hampers. The photos show a way of presenting a gift, and the items in them are placeholders. What goes inside yours, in which brands and colours, is settled with you.</p>

<figure>
<img src="/styles/keepsake-display-box.webp" alt="A clear display box lit with fairy lights, holding roses, framed photos, chocolates and a wrapped gift" width="1200" height="1200" loading="lazy" />
<figcaption>Style VS-01, Keepsake Display Box. Design concept: your hamper is made to your request and can look different.</figcaption>
</figure>

<h3>Keepsake Display Box</h3>

<p>A clear box with warm lights, built around your own photographs. This is the one for an anniversary, for parents from their children, or for someone far away, because the photos do most of the talking. Send the original files from your phone or camera, not screenshots or pictures saved from a chat, which print soft. Two or three photos are plenty. <a href="/custom-basket?style=keepsake-display-box">Start from this look</a>.</p>

<figure>
<img src="/styles/chocolate-roses-box.webp" alt="An open ivory box of truffles and cookies set among red and blush roses with a burgundy ribbon" width="1200" height="1200" loading="lazy" />
<figcaption>Style VS-02, Chocolate and Roses Box. Design concept: your hamper is made to your request and can look different.</figcaption>
</figure>

<h3>Chocolate and Roses Box</h3>

<p>The safest of the five, and the right choice when all you know for certain is that they have a sweet tooth. Tell us which chocolates they reach for, milk or dark, and whether anything should be avoided. A small keepsake can sit in the middle if you want the box to outlast the truffles. <a href="/custom-basket?style=chocolate-roses-box">Start from this look</a>.</p>

<figure>
<img src="/styles/blush-jewellery-box.webp" alt="A blush pink gift box with space for jewellery, a fragrance set, roses, chocolates and shortbread" width="1200" height="1200" loading="lazy" />
<figcaption>Style VS-03, Blush Jewellery Box. Design concept: your hamper is made to your request and can look different.</figcaption>
</figure>

<h3>Blush Jewellery Box</h3>

<p>Made for one small, valuable thing: a necklace, a watch, a fragrance set. The rest of the box exists to give that item a setting. It suits a milestone birthday or an anniversary where the main gift is already decided and you want it to arrive as more than a bag from the shop. Blush is the colour in the photo, not a rule. <a href="/custom-basket?style=blush-jewellery-box">Start from this look</a>.</p>

<figure>
<img src="/styles/rose-bouquet-gift.webp" alt="A dozen red roses and baby's breath in a black wrap with a ribboned gift box in the centre" width="1200" height="1247" loading="lazy" />
<figcaption>Style VS-04, Rose Bouquet with a Hidden Gift. Design concept: your hamper is made to your request and can look different.</figcaption>
</figure>

<h3>Rose Bouquet with a Hidden Gift</h3>

<p>A bouquet with a small box tucked into the centre of the flowers. It is the look to choose when the gift will be handed over in person, because the box is found a moment after the roses are. Tell us how many roses, which colour, and what goes in the box. Fresh flowers need two days' notice. <a href="/custom-basket?style=rose-bouquet-gift">Start from this look</a>.</p>

<figure>
<img src="/styles/favourites-tray.webp" alt="A presentation tray with a main gift, a fragrance, chocolates and small treats framed by roses and hydrangea" width="1200" height="800" loading="lazy" />
<figcaption>Style VS-05, Favourites Tray. Design concept: your hamper is made to your request and can look different.</figcaption>
</figure>

<h3>Favourites Tray</h3>

<p>An open tray arranged around one main gift, with wording across the front that you choose. It takes larger items than the boxes do, and it is the one we would point to for a man, since it works as well with a wallet, a cologne and a favourite snack as it does with flowers. Name the brands and scents they already use. That detail is what makes a tray look like theirs. <a href="/custom-basket?style=favourites-tray">Start from this look</a>.</p>

<p>None of the five is tied to an occasion. The photos happen to show an anniversary, and the same looks are made for birthdays, Valentine's Day, a proposal or no reason at all.</p>

<h2>Fresh flowers change the timing</h2>

<p>Anything with fresh flowers needs two days' notice, and it should be delivered on the day it will be given. Roses do not improve in a hallway. If the gift has to wait, or travel, or you want it to keep, ask for decorative flowers. They keep their shape and look much the same in a photo.</p>

<p>For everything else, earlier is better. A particular fragrance, a specific shade of foundation or printed and framed photos can take time to find. Put the date in the request. If we cannot do it properly by then, we will say so before you have paid anything.</p>

<h2>What we will not put in a hamper</h2>

<p>Alcohol. We do not hold a licence to sell it, so there is no wine, champagne or spirits in anything we make. An alcohol-free sparkling drink does the same job in the photo and at the table, and nobody has to explain why they are not drinking.</p>

<p>We also will not swap an item quietly. If the exact thing you asked for cannot be found, you will hear about it in the quote, with what we suggest instead, and you decide.</p>

<h2>After you send it</h2>

<p>We read the request, work out what it will cost, and reply by email or phone with a final price. Nothing is charged until you approve it. You can change the contents, trim it to a lower figure, or decide against it, and none of that costs anything.</p>

<p>When you are ready, <a href="/custom-basket">send us a custom request</a>, or go straight to the <a href="/occasions/anniversary">anniversary</a> and <a href="/occasions/birthday">birthday</a> baskets if a ready-made one will do. Plenty of the time it will.</p>`,
    fr: `<p>Un panier tout fait est un pari pris d'avance, pour personne en particulier. Il tombe juste plus souvent qu'on ne le croit, parce que presque tout le monde aime le bon chocolat et un café correct. Mais il arrive qu'on sache sur quelqu'un une chose qu'aucun catalogue ne peut savoir : le parfum qu'elle porte depuis dix ans, la photo du voyage de 2014, le fait qu'il préférerait un bon portefeuille à neuf petites gâteries. C'est là qu'un cadeau sur mesure vaut l'effort.</p>

<p>L'effort est plus petit qu'il n'y paraît. Chez nous, il tient en trois étapes. Vous choisissez un style, vous nous dites ce qu'il faut mettre à l'intérieur, et nous vous envoyons un prix avant toute facturation. Ce guide porte sur l'étape du milieu, parce que c'est là qu'un cadeau sur mesure se gagne ou se perd.</p>

<h2>Partez d'une chose, pas d'une liste</h2>

<p>Les demandes qui donnent les meilleurs résultats ont un centre. Un article que la personne reconnaîtra comme choisi pour elle, puis quelques petites choses pour l'accompagner. Un parfum entouré de chocolats et de roses. Une photo encadrée à côté d'un cadeau emballé. Une montre dans un coffret habillé pour l'occasion.</p>

<p>Les demandes qui peinent sont des listes de douze choses égales. Douze articles de même importance ressemblent à un sac d'épicerie, peu importe le soin de la présentation, et le budget s'étire tellement qu'aucun n'est la bonne version. Si vous hésitez, demandez-vous ce que vous offririez si vous ne pouviez donner qu'un seul article. Construisez à partir de là.</p>

<h2>Quoi écrire dans la demande</h2>

<p>Pas besoin d'en écrire long. Six ou sept lignes suffisent :</p>

<ul>
<li>L'occasion et la date à laquelle le cadeau doit arriver.</li>
<li>À qui il est destiné, en une phrase. « Ma femme, nos dix ans de mariage, elle n'aime pas ce qui est trop rose » nous en dit plus qu'un paragraphe d'adjectifs.</li>
<li>Le cadeau principal, aussi précisément que possible. Marque, nom, format, teinte. « Chanel Chance Eau Tendre, 50 ml », on peut en donner le prix. « Un beau parfum », non.</li>
<li>Ce qu'il faut éviter. Les allergies d'abord, puis ce qu'elle n'aime pas : pas de noix, pas de chocolat noir, rien de trop parfumé.</li>
<li>Les couleurs, si vous y tenez. Sinon, nous suivons le style choisi.</li>
<li>Votre budget.</li>
<li>Le code postal de livraison, pour que les frais indiqués dans le devis soient les vrais.</li>
</ul>

<p>Si la carte doit dire quelque chose de précis, ajoutez-le aussi. Si vous n'avez pas décidé, <a href="/fr/guides/what-to-write-in-a-gift-message">notre guide des messages-cadeaux</a> propose des formulations pour la plupart des occasions.</p>

<h2>Dites votre budget</h2>

<p>Les gens laissent le budget vide parce qu'ils pensent qu'un chiffre nous invite à tout dépenser. C'est le contraire. Sans chiffre, nous devons deviner, et le résultat est soit trop modeste pour l'occasion, soit plus cher que ce que vous vouliez payer. Dans les deux cas, le premier devis ne sert à rien et vous perdez du temps.</p>

<p>Il est utile aussi de savoir où va l'argent. Dans la plupart des cadeaux sur mesure, l'article principal prend la plus grande part, et de loin. Un flacon de 50 ml d'un parfum de grande marque coûte souvent 100 $ ou plus au Canada, avant qu'il y ait quoi que ce soit d'autre dans le coffret. Les roses fraîches, le coffret ou le plateau, les chocolats et le temps de tout disposer s'ajoutent. Un budget de 150 $ avec un parfum de grande marque au centre laisse donc très peu pour le reste, et mieux vaut l'apprendre de nous au départ que d'être déçu par la photo. Donnez-nous le chiffre et ce qui compte le plus, et nous vous dirons franchement ce qui entre.</p>

<h2>Cinq styles pour commencer</h2>

<p>La plupart des gens trouvent plus facile de montrer une image que de décrire une présentation. Nous gardons donc cinq styles sur le site. Ce sont des concepts de design, pas des paniers fixes. Les photos montrent une façon de présenter un cadeau, et les articles qu'on y voit tiennent lieu d'exemples. Ce qui ira dans le vôtre, de quelles marques et de quelles couleurs, se décide avec vous.</p>

<figure>
<img src="/styles/keepsake-display-box.webp" alt="Un coffret transparent éclairé de petites lumières, avec des roses, des photos encadrées, des chocolats et un cadeau emballé" width="1200" height="1200" loading="lazy" />
<figcaption>Style VS-01, Coffret vitrine souvenir. Concept de design : votre panier est composé selon votre demande et peut différer de la photo.</figcaption>
</figure>

<h3>Coffret vitrine souvenir</h3>

<p>Un coffret transparent aux lumières chaudes, composé autour de vos propres photos. C'est celui qu'on choisit pour un anniversaire de mariage, pour des parents de la part de leurs enfants, ou pour quelqu'un qui vit loin, parce que les photos disent presque tout. Envoyez les fichiers d'origine de votre téléphone ou de votre appareil, pas des captures d'écran ni des images enregistrées d'une conversation, qui s'impriment floues. Deux ou trois photos suffisent amplement. <a href="/fr/custom-basket?style=keepsake-display-box">Partir de ce style</a>.</p>

<figure>
<img src="/styles/chocolate-roses-box.webp" alt="Un coffret ivoire ouvert garni de truffes et de biscuits, entouré de roses rouges et rose pâle, avec un ruban bourgogne" width="1200" height="1200" loading="lazy" />
<figcaption>Style VS-02, Coffret chocolats et roses. Concept de design : votre panier est composé selon votre demande et peut différer de la photo.</figcaption>
</figure>

<h3>Coffret chocolats et roses</h3>

<p>Le plus sûr des cinq, et le bon choix quand tout ce que vous savez avec certitude, c'est que la personne a la dent sucrée. Dites-nous quels chocolats elle prend d'abord, au lait ou noir, et s'il faut éviter quelque chose. Un petit souvenir peut prendre place au milieu si vous voulez que le coffret dure plus longtemps que les truffes. <a href="/fr/custom-basket?style=chocolate-roses-box">Partir de ce style</a>.</p>

<figure>
<img src="/styles/blush-jewellery-box.webp" alt="Un coffret rose poudré avec un espace pour un bijou, un coffret parfum, des roses, des chocolats et des sablés" width="1200" height="1200" loading="lazy" />
<figcaption>Style VS-03, Coffret bijoux rose poudré. Concept de design : votre panier est composé selon votre demande et peut différer de la photo.</figcaption>
</figure>

<h3>Coffret bijoux rose poudré</h3>

<p>Conçu pour un seul petit objet de valeur : un collier, une montre, un coffret parfum. Le reste du coffret sert à lui donner un écrin. Il convient à un anniversaire marquant ou à un anniversaire de mariage quand le cadeau principal est déjà choisi et que vous voulez qu'il arrive autrement que dans le sac du magasin. Le rose poudré est la couleur de la photo, pas une règle. <a href="/fr/custom-basket?style=blush-jewellery-box">Partir de ce style</a>.</p>

<figure>
<img src="/styles/rose-bouquet-gift.webp" alt="Une douzaine de roses rouges et de la gypsophile dans un emballage noir, avec un petit coffret enrubanné au centre" width="1200" height="1247" loading="lazy" />
<figcaption>Style VS-04, Bouquet de roses et cadeau caché. Concept de design : votre panier est composé selon votre demande et peut différer de la photo.</figcaption>
</figure>

<h3>Bouquet de roses et cadeau caché</h3>

<p>Un bouquet avec un petit coffret niché au centre des fleurs. C'est le style à choisir quand le cadeau sera remis en personne, parce qu'on découvre le coffret un instant après les roses. Dites-nous combien de roses, de quelle couleur, et ce qui va dans le coffret. Les fleurs fraîches demandent un préavis de deux jours. <a href="/fr/custom-basket?style=rose-bouquet-gift">Partir de ce style</a>.</p>

<figure>
<img src="/styles/favourites-tray.webp" alt="Un plateau de présentation avec un cadeau principal, un parfum, des chocolats et de petites attentions, encadrés de roses et d'hortensias" width="1200" height="800" loading="lazy" />
<figcaption>Style VS-05, Plateau des favoris. Concept de design : votre panier est composé selon votre demande et peut différer de la photo.</figcaption>
</figure>

<h3>Plateau des favoris</h3>

<p>Un plateau ouvert disposé autour d'un cadeau principal, avec à l'avant un message que vous choisissez. Il accueille des articles plus gros que les coffrets, et c'est celui que nous conseillerions pour un homme, puisqu'il fonctionne aussi bien avec un portefeuille, une eau de Cologne et une collation préférée qu'avec des fleurs. Nommez les marques et les parfums que la personne utilise déjà. C'est ce détail qui fait qu'un plateau lui ressemble. <a href="/fr/custom-basket?style=favourites-tray">Partir de ce style</a>.</p>

<p>Aucun des cinq n'est lié à une occasion. Les photos montrent un anniversaire de mariage, et les mêmes styles se font pour un anniversaire, la Saint-Valentin, une demande en mariage ou sans raison particulière.</p>

<h2>Les fleurs fraîches changent le calendrier</h2>

<p>Tout ce qui comporte des fleurs fraîches demande un préavis de deux jours et devrait être livré le jour où il sera offert. Les roses ne s'améliorent pas dans un vestibule. Si le cadeau doit attendre ou voyager, ou si vous voulez qu'il se conserve, demandez des fleurs décoratives. Elles gardent leur forme et rendent à peu près pareil en photo.</p>

<p>Pour tout le reste, le plus tôt est le mieux. Un parfum en particulier, une teinte précise de fond de teint ou des photos imprimées et encadrées peuvent prendre du temps à trouver. Indiquez la date dans la demande. Si nous ne pouvons pas bien le faire d'ici là, nous vous le dirons avant que vous ayez payé quoi que ce soit.</p>

<h2>Ce que nous ne mettons pas dans un panier</h2>

<p>L'alcool. Nous n'avons pas de permis pour en vendre, donc il n'y a ni vin, ni champagne, ni spiritueux dans ce que nous faisons. Un mousseux sans alcool joue le même rôle sur la photo et à table, et personne n'a à expliquer pourquoi il ne boit pas.</p>

<p>Nous ne remplaçons pas non plus un article en douce. Si l'article exact que vous avez demandé est introuvable, vous le saurez dans le devis, avec ce que nous proposons à la place, et c'est vous qui décidez.</p>

<h2>Une fois la demande envoyée</h2>

<p>Nous lisons la demande, calculons ce qu'elle coûtera et répondons par courriel ou par téléphone avec un prix final. Rien n'est facturé tant que vous ne l'avez pas approuvé. Vous pouvez modifier le contenu, le ramener à un montant plus bas ou y renoncer, et rien de tout cela ne coûte quoi que ce soit.</p>

<p>Quand vous êtes prêt, <a href="/fr/custom-basket">envoyez-nous une demande sur mesure</a>, ou allez directement aux paniers d'<a href="/fr/occasions/anniversary">anniversaire de mariage</a> et d'<a href="/fr/occasions/birthday">anniversaire</a> si un panier tout fait convient. C'est souvent le cas.</p>`,
  },
};

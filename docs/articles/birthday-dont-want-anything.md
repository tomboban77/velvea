# Guide: birthday gifts for someone who says they don't want anything

Status: **published 26 Oct 2026** (written to the database by script; edit it in Admin -> Articles from now on).

Checked on 26 Oct 2026:

- Every link in both bodies returns 200 on www.velvea.ca (EN and FR product pages,
  `/custom-basket`, `/fr/custom-basket`).
- Every item the post names (fudge, pretzels, gerberas, hand cream, nut mix and so on) is still
  listed in the live basket contents. If a basket's contents change, update the paragraph.
- Both bodies pass through `sanitizeHtml` (`src/lib/sanitize.ts`) unchanged, so what you paste
  is what is published.
- Delivery and card claims come straight from the FAQ copy in `messages/en.json`: same-day on
  eligible orders in Mississauga and the GTA, tracked shipping elsewhere in Ontario, message
  card included at no charge, prices never included. No prices are quoted, so the post won't go
  stale when prices change.

| Field | Value |
|---|---|
| Title (EN) | Birthday Gifts for Someone Who Says They Don't Want Anything |
| Title (FR) | Cadeaux d'anniversaire pour quelqu'un qui dit ne rien vouloir |
| Slug | `birthday-gifts-for-someone-who-doesnt-want-anything` |
| Category | OCCASIONS (shows as "occasions", which reads correctly in both languages) |
| Author | Velvéa |
| Read minutes | 5 |
| Status | Published, once you're happy with it |
| Featured | Off (the storefront doesn't use the flag; guides sort newest first) |
| Cover image | Upload `import/images/birth2.png` (the Snack Hatbox, whose tag reads "A Little Something Special") |

## Excerpt

EN:

```
"Don't get me anything" rarely means nothing at all. How to tell what they actually mean, and choose a birthday basket that respects it.
```

FR:

```
« Ne m'achète rien » veut rarement dire rien du tout. Comment comprendre ce que la personne veut vraiment dire, et choisir un panier d'anniversaire qui respecte son souhait.
```

## SEO title and description

The site appends " · Velvéa" to these automatically.

EN title:

```
Birthday Gifts for Someone Who Doesn't Want Anything
```

EN description:

```
Gift ideas for the person who insists on no presents: edible birthday baskets, what to write in the card, and delivery across Mississauga and the GTA.
```

FR title:

```
Cadeau d'anniversaire pour qui ne veut rien
```

FR description:

```
Des idées pour la personne qui refuse les cadeaux : paniers d'anniversaire à savourer, quoi écrire sur la carte et livraison à Mississauga et dans la RGT.
```

## Body (EN)

```html
<p>Most of us have one person like this. A couple of weeks before their birthday they say it, sometimes more than once: "Please don't get me anything." A few of them mean it. Most mean something narrower than that, and once you work out what, choosing a gift gets a lot easier.</p>

<h2>What they usually mean</h2>
<p>Often it's about stuff. Their cupboards are full and they're tired of finding room for things they never asked for. That person isn't against gifts, only against clutter.</p>
<p>Sometimes it's about money. Parents say it a lot, and so do friends who like to keep things even. They don't want you spending on them, or to feel they owe you the same back.</p>
<p>Some people just buy what they want, when they want it. There's nothing on their wish list because they never needed one. A gift for them has to be something they wouldn't think to pick up for themselves.</p>
<p>And some dislike the moment more than the present: unwrapping it while everyone watches, finding the right thing to say. The gift isn't the problem. The audience is.</p>
<p>None of these is really "I'd be upset to get something." It's closer to "please don't make it a burden," and that's something you can work with.</p>

<h2>Why food is the safe bet</h2>
<p>A basket of good chocolate, snacks or tea gets around most of this. Once it's eaten, it's gone. Nobody expects to see it on a shelf the next time they visit. It's easy to share, too, which suits the person who would rather put it out for the whole table than have the day be about them.</p>
<p>Where it goes wrong is when it looks like a few things grabbed at the checkout. What makes it feel like a gift is a handful of things they actually like, put together with some care, and a card that shows you were thinking of them in particular.</p>

<h2>Picking a basket that fits</h2>

<h3>If they hate clutter</h3>
<p>Keep it all edible. Our <a href="/products/sweet-savoury-snack-hatbox">Sweet &amp; Savoury Snack Hatbox</a> has chocolate-covered pretzels, Laura Secord fudge, caramel popcorn and a sweet chili nut mix, so it works for a sweet tooth and for the person who always ends up next to the chip bowl. The only thing left at the end is the ivory hatbox, which is handy for storage.</p>

<h3>If they don't want you spending much</h3>
<p>Go smaller and brighter instead of bigger. The <a href="/products/cocoa-clementine-gift-basket">Cocoa &amp; Clementine Gift Basket</a> is a few well-loved chocolate bars, including Kinder Bueno, Reese's, Lindt and a Biscoff Dairy Milk, with fresh orange gerberas tucked in. It looks cheerful rather than extravagant, and for this person that's what you want.</p>

<h3>If they already have everything</h3>
<p>Think about the small luxuries people leave out when they shop for themselves. Not many of us buy the nice hand cream or a good candle on a normal grocery run. The <a href="/products/blush-indulgence-gift-hamper">Blush &amp; Indulgence Gift Hamper</a> pairs Japanese Cherry Blossom hand cream and a matching candle with rose hibiscus tea, Lindt LINDOR truffles and a few snacks. It does include a nut mix, so if nuts are an issue, ask us to swap it before you order.</p>

<h3>If it's a big birthday</h3>
<p>A 50th or a 70th is the one time you can politely ignore "don't get me anything." The <a href="/products/birthday-bliss-gourmet-gift-hamper">Birthday Bliss Gourmet Gift Hamper</a> is the fuller option: Lindt chocolates, fudge, popcorn, cashews and a birthday card, packed in a reusable silver gift box. Everything in it still gets eaten, so you're bending their rule rather than breaking it.</p>
<p>Buying for someone easier to please? Our <a href="/guides/birthday-gift-basket-ideas">birthday gift basket ideas</a> go through friends, parents, partners and colleagues.</p>

<h2>If you already know what they'd like</h2>
<p>Sometimes you know exactly what would make them happy: the coffee they always buy, a particular brand of crackers, a tea they mentioned once and never got round to buying. Send us the list through our <a href="/custom-basket">custom basket request</a> and we'll find the items and arrange them the way we do our own baskets. A request can be as simple as this:</p>
<blockquote>Dark roast ground coffee, a box of shortbread, a bar of dark chocolate and some fresh flowers. She's diabetic, so nothing too sweet, please. Around $100.</blockquote>
<p>We'll reply with a price, and nothing is charged until you approve it. If one of our baskets is nearly right, use the "Change or ask about this basket" link on its page and tell us what to swap.</p>

<h2>Spend a minute on the card</h2>
<p>When someone has asked you not to bother, what you write carries more weight than usual. "Happy birthday, enjoy!" is fine, but a line that could only be about them is better. A few to borrow or adapt:</p>
<ul>
  <li>"I know, you said nothing. This was as close to nothing as I could manage."</li>
  <li>"For the one who always brings the snacks. Your turn."</li>
  <li>"I listened when you said no fuss. This is the quiet version."</li>
</ul>
<p>Every Velvéa basket comes with your message printed on a card at no extra cost. Prices are never included with the gift, which helps with the person who would otherwise go looking to see what you spent. For more on getting the wording right, see our guide to <a href="/guides/what-to-write-in-a-gift-message">what to write in a gift message</a>.</p>

<h2>Let it turn up on its own</h2>
<p>For this kind of person, a basket that simply arrives at the door often goes down better than one handed over at the party with everyone watching. We deliver across Mississauga and the GTA ourselves, including same-day on eligible orders, and ship with tracking to the rest of Ontario. Your delivery options show at checkout once you enter the postal code.</p>
<p>They'll probably still tell you that you shouldn't have. Usually, that means you got it right.</p>
```

## Body (FR)

```html
<p>On a presque tous quelqu'un comme ça dans notre entourage. Quelques semaines avant sa fête, la phrase tombe, parfois plus d'une fois : « Surtout, ne m'achète rien. » Certains le pensent vraiment. La plupart veulent dire quelque chose de plus précis, et une fois qu'on a compris quoi, le choix du cadeau devient beaucoup plus simple.</p>

<h2>Ce que ça veut dire, la plupart du temps</h2>
<p>Souvent, c'est une question d'objets. Les armoires débordent et la personne en a assez de trouver de la place pour des choses qu'elle n'a jamais demandées. Elle n'a rien contre les cadeaux, seulement contre l'encombrement.</p>
<p>Parfois, c'est une question d'argent. Les parents le disent souvent, tout comme les amis qui aiment que les choses restent égales. Ils ne veulent pas que vous dépensiez pour eux, ni se sentir obligés de vous rendre la pareille.</p>
<p>Certaines personnes s'achètent tout simplement ce qu'elles veulent, quand elles le veulent. Elles n'ont pas de liste de souhaits parce qu'elles n'en ont jamais eu besoin. Pour elles, le cadeau doit être une chose qu'elles n'auraient pas pensé à s'offrir.</p>
<p>Et d'autres n'aiment pas le moment lui-même : déballer un cadeau sous le regard de tout le monde, trouver les bons mots. Le problème n'est pas le cadeau, c'est le public.</p>
<p>Aucune de ces raisons ne veut vraiment dire « ça me dérangerait de recevoir quelque chose ». Ça ressemble plutôt à « ne m'en fais pas un fardeau », et ça, on peut travailler avec.</p>

<h2>Pourquoi miser sur ce qui se mange</h2>
<p>Un panier de bon chocolat, de grignotines ou de thé règle la plupart de ces questions. Une fois mangé, il disparaît. Personne ne s'attend à le voir sur une tablette à la prochaine visite. Il se partage aussi très bien, ce qui convient à la personne qui préfère le mettre au milieu de la table plutôt que d'être le centre de l'attention.</p>
<p>Là où ça se gâte, c'est quand le panier a l'air de quelques articles pris à la caisse. Ce qui en fait un vrai cadeau, ce sont quelques produits que la personne aime vraiment, présentés avec soin, et une carte qui montre que vous avez pensé à elle en particulier.</p>

<h2>Choisir le bon panier</h2>

<h3>Pour qui déteste l'encombrement</h3>
<p>Gardez tout comestible. Notre <a href="/fr/products/sweet-savoury-snack-hatbox">Coffret gourmand sucré-salé</a> contient des bretzels enrobés de chocolat, du fudge Laura Secord, du maïs soufflé au caramel et un mélange de noix au chili doux. Il y en a pour la dent sucrée comme pour ceux qui finissent toujours près du bol de croustilles. À la fin, il ne reste que la boîte à chapeau ivoire, bien pratique pour ranger.</p>

<h3>Pour qui ne veut pas que vous dépensiez trop</h3>
<p>Misez sur plus petit et plus joyeux plutôt que plus gros. Le <a href="/fr/products/cocoa-clementine-gift-basket">Panier cadeau Cacao &amp; Clémentine</a> réunit quelques tablettes de chocolat que tout le monde aime, dont Kinder Bueno, Reese's, Lindt et une Dairy Milk Biscoff, avec des gerberas orange fraîches. Il a l'air gai plutôt que luxueux, et c'est exactement ce qu'il faut ici.</p>

<h3>Pour qui a déjà tout</h3>
<p>Pensez aux petits luxes qu'on oublie quand on magasine pour soi. Peu de gens achètent la belle crème pour les mains ou une bonne bougie en faisant l'épicerie. Le <a href="/fr/products/blush-indulgence-gift-hamper">Coffret cadeau Douceur et Plaisir</a> associe une crème pour les mains et une bougie assortie Japanese Cherry Blossom à une tisane rose et hibiscus, des truffes Lindt LINDOR et quelques grignotines. Il contient un mélange de noix : si c'est un problème, demandez-nous de le remplacer avant de commander.</p>

<h3>Pour une fête marquante</h3>
<p>Un 50e ou un 70e, c'est la seule occasion où l'on peut poliment ignorer « ne m'achète rien ». Le <a href="/fr/products/birthday-bliss-gourmet-gift-hamper">Coffret gourmand Douceurs d'anniversaire</a> est l'option la plus généreuse : chocolats Lindt, fudge, maïs soufflé, noix de cajou et carte d'anniversaire, dans une boîte ronde argentée réutilisable. Tout se mange quand même, alors vous contournez la règle sans vraiment l'enfreindre.</p>
<p>Vous cherchez pour quelqu'un de plus facile à contenter ? Nos <a href="/fr/guides/birthday-gift-basket-ideas">idées de paniers d'anniversaire</a> passent en revue les amis, les parents, les conjoints et les collègues.</p>

<h2>Si vous savez déjà ce qui lui ferait plaisir</h2>
<p>Parfois, vous savez exactement ce qui ferait plaisir : le café que la personne achète toujours, une marque de craquelins en particulier, un thé dont elle a parlé une fois sans jamais se le procurer. Envoyez-nous la liste par notre <a href="/fr/custom-basket">demande de panier personnalisé</a> : nous trouvons les produits et les présentons comme nos propres paniers. Une demande peut être aussi simple que celle-ci :</p>
<blockquote>Du café moulu torréfaction foncée, une boîte de sablés, une tablette de chocolat noir et quelques fleurs fraîches. Elle est diabétique, donc rien de trop sucré, s'il vous plaît. Environ 100 $.</blockquote>
<p>Nous vous répondons avec un prix, et rien n'est facturé avant votre approbation. Si l'un de nos paniers est presque parfait, utilisez le lien « Modifier ce panier ou poser une question » sur sa page et dites-nous quoi changer.</p>

<h2>Prenez une minute pour la carte</h2>
<p>Avec quelqu'un qui vous a demandé de ne pas vous donner de peine, ce que vous écrivez compte plus que d'habitude. « Bonne fête, profites-en ! » fait l'affaire, mais une phrase qui ne pourrait s'adresser qu'à cette personne, c'est mieux. En voici quelques-unes à emprunter ou à adapter :</p>
<ul>
  <li>« Je sais, tu as dit rien. J'ai fait de mon mieux pour que ça y ressemble. »</li>
  <li>« Pour toi qui apportes toujours les grignotines. Cette fois, c'est ton tour. »</li>
  <li>« J'ai bien entendu : pas de chichi. Voici la version discrète. »</li>
</ul>
<p>Chaque panier Velvéa est accompagné de votre message imprimé sur une carte, sans frais supplémentaires. Les prix ne sont jamais inclus avec le cadeau, ce qui évite les questions de la personne qui voudrait savoir combien vous avez dépensé. Pour trouver les bons mots, consultez notre guide <a href="/fr/guides/what-to-write-in-a-gift-message">Quoi écrire sur une carte-cadeau</a>.</p>

<h2>Laissez-le arriver tout seul</h2>
<p>Pour ce genre de personne, un panier qui arrive simplement à la porte passe souvent mieux qu'un cadeau remis pendant la fête, devant tout le monde. Nous livrons nous-mêmes à Mississauga et dans la RGT, y compris le jour même pour les commandes admissibles, et expédions avec suivi partout ailleurs en Ontario. Les options de livraison s'affichent au paiement dès que vous entrez le code postal.</p>
<p>On vous dira sans doute que vous n'auriez pas dû. En général, ça veut dire que vous avez visé juste.</p>
```

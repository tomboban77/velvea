import type { GuideSeed } from "./types";

/**
 * The fourth corporate guide, and the one about how a company gift feels when
 * it is opened. Tax and budgets, hamper contents and the December office
 * calendar each have their own page; this one stays on the personal part
 * (one fact per recipient, who signs, writing about the year, the household,
 * a hard year, the person who did the work) and links out for the rest.
 *
 * Service claims (a different printed message per recipient, branded cards,
 * delivery to each address across Ontario, one invoice, one-business-day quote
 * reply, the ready-to-send boxes on /corporate) match the other corporate
 * guides and messages/*.json. The 10-basket online cap is MAX_ORDER_ITEMS in
 * src/lib/order-limits.ts. No product names and no prices.
 */
export const personalCorporateChristmasGifts: GuideSeed = {
  slug: "corporate-christmas-gifts-that-feel-personal",
  category: "CORPORATE",
  readMinutes: 7,
  featured: false,
  title: {
    en: "Corporate Christmas gifts that feel personal, even when you're sending fifty",
    fr: "Des cadeaux de Noël d'entreprise qui ont l'air personnels, même quand on en envoie cinquante",
  },
  excerpt: {
    en: "Most company gifts are polite and forgotten by January. What makes the difference is rarely the budget. It's the note, who signs it, and one real detail about the person opening it.",
    fr: "La plupart des cadeaux d'entreprise sont polis et oubliés en janvier. Ce qui fait la différence, c'est rarement le budget. C'est le mot, la personne qui le signe et un vrai détail sur celle qui l'ouvre.",
  },
  seoTitle: {
    en: "Corporate Christmas Gifts That Feel Personal: Clients and Staff",
    fr: "Cadeaux de Noël d'entreprise personnalisés : clients et employés",
  },
  seoDescription: {
    en: "How to make corporate Christmas gifts for clients and employees feel personal at any scale: what to write, who should sign, sending to homes, and handling a hard year.",
    fr: "Comment rendre vos cadeaux de Noël d'entreprise personnels, peu importe le nombre : quoi écrire, qui signe, l'envoi à domicile et les années difficiles.",
  },
  body: {
    en: `<p>Picture where your gift actually gets opened. Not in a boardroom. On a kitchen counter at six in the evening, by someone still in their coat, with a child asking what's in the box. They will read the card first, and within about ten seconds they will know whether it came from a person or from a mailing list.</p>

<p>Most corporate Christmas gifts fail that test, and the budget has little to do with it. They fail because nothing in them could only have been sent to that one person. The same box, the same "Season's greetings from all of us at", the same logo on the ribbon. It's polite, and it's forgotten by January.</p>

<p>Making a company gift feel personal costs very little money. It costs attention, and it works at fifty addresses as well as at five. Our other guides cover <a href="/guides/corporate-gifting-ontario-cra-rules-budgets-timing">the CRA rules and budgets</a>, <a href="/guides/corporate-gift-hampers-how-to-choose">what goes in the hamper</a> and <a href="/guides/christmas-gifts-for-clients-employees-coworkers">the December calendar for offices</a>. This one is about the part people remember.</p>

<h2>Start with one fact about each person</h2>

<p>Before you choose anything, open the list and add one column. In it, write something you know about each recipient. Not their title. Something human.</p>

<p>She ran her first marathon in May. He became a dad in the spring. They stopped eating meat last year. The whole team worked through that brutal October deadline.</p>

<p>Most account managers can fill the column in twenty minutes, and it changes everything that comes after. It tells you what to send: very good coffee for the new father who hasn't slept since April, nothing with dairy for the client who is vegan. And it gives the card something real to say.</p>

<h2>Let a real person sign it</h2>

<p>"From all of us at" is how a company signs when nobody in particular wanted to. A card signed by the person who actually worked with the recipient reads completely differently, even when the gift inside is identical.</p>

<p>On corporate orders we can print a different message for each recipient, so the account manager's words go to their client and the founder's go to the people who backed the business early. Ask each person who owns a relationship to write their own two lines. Give them a deadline and a limit of about forty words, or you will get essays from some and nothing from the rest.</p>

<h2>Write about the year, not the season</h2>

<p>Holiday cards drift toward the same handful of phrases. Joy, warmth, the season, the year ahead. A sentence about something that actually happened this year does more than all of them together. A few examples:</p>

<ul>
<li>"Thank you for trusting us with the warehouse move in March. We know how much was riding on it."</li>
<li>"You picked up the phone at nine at night when the launch broke. We haven't forgotten."</li>
<li>"Congratulations on the new office. We hope this gets opened in the new kitchen."</li>
<li>"This was your first year with us, and it felt like you'd been here for ten."</li>
</ul>

<p>One specific line is what gets a card pinned above a desk instead of recycled with the box.</p>

<h2>Think about who else is at the table</h2>

<p>A basket sent to someone's home doesn't stay with them. It gets opened with a partner, picked at by the kids, put out when the in-laws come over. In practice you are sending a gift to a household, so choose things that can be passed around: chocolate, cookies, popcorn, a tin of shortbread. Leave out anything that only works for one person.</p>

<p>Then use that. A line on the card for the family is the one that gets read out at dinner: "Thank you for lending us Priya this year. We know the late nights came out of your evenings too."</p>

<p>For staff, ask for home addresses well ahead, make it clearly optional, and let people pick the office instead. Some people would rather not share where they live, and that is their call to make.</p>

<h2>When the year was hard</h2>

<p>Some years the gift arrives in a difficult context. Layoffs, a bonus that didn't come, a restructuring that left everyone tired. A cheerful hamper can land badly if it looks like a stand-in for what people actually lost.</p>

<p>If it was that kind of year, say so plainly in the note, keep the gift modest and warm, and don't dress it up as a reward. "It's been a hard year, and you carried a lot of it. Thank you." is more honest than "Celebrating another great year together!" People can tell the difference, and they remember which one they got.</p>

<p>The same goes for individuals. The client who lost a parent in the autumn. The employee who came back from medical leave in November. Your fact column will catch most of these. For them, leave out the festive language. A quiet note and something comforting reads as care. A red and gold "Ho ho ho" reads as a mail merge.</p>

<h2>Find the person who did the work</h2>

<p>On the client side, the gift usually goes to the most senior name on the account. But the relationship often runs on someone else: the project coordinator who chased every sign-off, the assistant who found a slot in an impossible calendar, the person in accounts payable who made sure your invoices were paid on time.</p>

<p>Add them to the list. They are the least likely to expect anything and the most likely to remember it. If their organisation has a gift policy, a basket addressed to the whole team works around it, and the <a href="/guides/christmas-gifts-for-clients-employees-coworkers">Christmas at work guide</a> explains how.</p>

<h2>Keep the logo small</h2>

<p>The person opening the box should feel thanked, not marketed to. A branded card is plenty. Logo stickers on every item, a brochure tucked under the chocolate, a mug with the company name in large type: each one turns a thank-you back into an advertisement. If you want your brand in the box, put it in the signature. <a href="/guides/corporate-gift-hampers-how-to-choose">Our hamper guide</a> has more on branding that doesn't get in the way.</p>

<h2>Don't follow it with a sales email</h2>

<p>The fastest way to undo a good gift is a message the next morning that begins "Hope you enjoyed the basket!" and ends with a question about next quarter. Let the gift stand on its own. If they write to say thank you, reply like a person. The business conversation can wait until January, and it usually goes better for the wait.</p>

<h2>How we help with the personal part</h2>

<p>On corporate orders we print a separate message for each recipient, add your branding to the card if you want it, deliver to every address on your list across Ontario, and send you one invoice. Online orders go up to ten baskets; for anything larger, <a href="/corporate/quote">send us your list and budget</a> and we reply within one business day. The ready-to-send boxes on our <a href="/corporate">corporate page</a> are there if you need something fast, and you can also browse <a href="/recipients/clients">gifts for clients</a> and <a href="/recipients/employees">gifts for employees</a>.</p>

<p>Fifty gifts is a lot of boxes. It is also fifty chances to tell someone you noticed what they did this year. That is worth an afternoon with a spreadsheet.</p>`,

    fr: `<p>Imaginez où votre cadeau est réellement ouvert. Pas dans une salle de réunion. Sur un comptoir de cuisine, à six heures du soir, par quelqu'un qui n'a pas encore enlevé son manteau, avec un enfant qui demande ce qu'il y a dans la boîte. La personne lit d'abord la carte, et en une dizaine de secondes, elle sait si le cadeau vient d'une personne ou d'une liste d'envoi.</p>

<p>La plupart des cadeaux de Noël d'entreprise échouent à ce test, et le budget n'y est pas pour grand-chose. Ils échouent parce que rien en eux n'aurait pu être destiné à cette seule personne. La même boîte, le même « Joyeuses Fêtes de toute l'équipe de », le même logo sur le ruban. C'est poli, et c'est oublié en janvier.</p>

<p>Rendre un cadeau d'entreprise personnel coûte très peu d'argent. Ça demande de l'attention, et ça fonctionne aussi bien pour cinquante adresses que pour cinq. Nos autres guides traitent des <a href="/fr/guides/corporate-gifting-ontario-cra-rules-budgets-timing">règles de l'ARC et des budgets</a>, de <a href="/fr/guides/corporate-gift-hampers-how-to-choose">ce qu'on met dans le panier</a> et du <a href="/fr/guides/christmas-gifts-for-clients-employees-coworkers">calendrier de décembre au bureau</a>. Celui-ci porte sur ce dont les gens se souviennent.</p>

<h2>Commencez par un fait sur chaque personne</h2>

<p>Avant de choisir quoi que ce soit, ouvrez la liste et ajoutez une colonne. Notez-y quelque chose que vous savez de chaque destinataire. Pas son titre. Quelque chose d'humain.</p>

<p>Elle a couru son premier marathon en mai. Il est devenu papa au printemps. Ils ont arrêté de manger de la viande l'an dernier. Toute l'équipe a traversé cette échéance infernale d'octobre.</p>

<p>La plupart des gestionnaires de compte peuvent remplir cette colonne en vingt minutes, et elle change tout ce qui suit. Elle vous dit quoi envoyer : du très bon café pour le nouveau papa qui ne dort plus depuis avril, rien de laitier pour la cliente végane. Et elle donne à la carte quelque chose de vrai à dire.</p>

<h2>Faites signer une vraie personne</h2>

<p>« De toute l'équipe de » est la signature d'une entreprise quand personne en particulier n'a voulu signer. Une carte signée par la personne qui a réellement travaillé avec le destinataire se lit tout autrement, même quand le cadeau est identique.</p>

<p>Pour les commandes d'entreprise, nous pouvons imprimer un message différent pour chaque destinataire : les mots du gestionnaire de compte vont à son client, ceux de la fondatrice vont aux gens qui ont cru en l'entreprise dès le début. Demandez à chaque personne responsable d'une relation d'écrire ses deux lignes. Donnez-leur une date limite et une limite d'environ quarante mots, sinon vous recevrez des romans de certains et rien des autres.</p>

<h2>Parlez de l'année, pas de la saison</h2>

<p>Les cartes des Fêtes finissent toutes par reprendre les mêmes formules. La joie, la chaleur, la magie de la saison, l'année qui vient. Une phrase sur quelque chose qui s'est réellement passé cette année vaut plus que toutes réunies. Quelques exemples :</p>

<ul>
<li>« Merci de nous avoir confié le déménagement de l'entrepôt en mars. Nous savons tout ce qui en dépendait. »</li>
<li>« Vous avez répondu au téléphone à neuf heures du soir quand le lancement a planté. Nous ne l'avons pas oublié. »</li>
<li>« Félicitations pour les nouveaux bureaux. Nous espérons que ce panier sera ouvert dans la nouvelle cuisine. »</li>
<li>« C'était votre première année avec nous, et on aurait dit que vous étiez là depuis dix ans. »</li>
</ul>

<p>C'est une phrase précise qui fait qu'une carte finit punaisée au-dessus d'un bureau plutôt qu'au recyclage avec la boîte.</p>

<h2>Pensez aux autres personnes autour de la table</h2>

<p>Un panier envoyé à la maison ne reste pas entre les mains d'une seule personne. On l'ouvre avec son conjoint, les enfants y piochent, on le sort quand la belle-famille passe. En pratique, vous offrez un cadeau à une maisonnée : choisissez donc des choses qui se partagent, comme du chocolat, des biscuits, du maïs soufflé ou une boîte de sablés. Laissez de côté ce qui ne convient qu'à une seule personne.</p>

<p>Puis servez-vous-en. Une ligne pour la famille sur la carte, c'est celle qu'on lit à voix haute au souper : « Merci de nous avoir prêté Priya cette année. Nous savons que les soirées tardives ont aussi pris sur les vôtres. »</p>

<p>Pour le personnel, demandez les adresses personnelles bien à l'avance, précisez clairement que c'est facultatif et laissez chacun choisir le bureau à la place. Certaines personnes préfèrent ne pas dire où elles habitent, et c'est à elles d'en décider.</p>

<h2>Quand l'année a été difficile</h2>

<p>Certaines années, le cadeau arrive dans un contexte délicat. Des mises à pied, une prime qui n'est pas venue, une restructuration qui a épuisé tout le monde. Un panier joyeux peut être mal reçu s'il ressemble à un substitut de ce que les gens ont réellement perdu.</p>

<p>Si l'année a été de ce genre, dites-le simplement dans le mot, gardez un cadeau modeste et chaleureux, et ne le présentez pas comme une récompense. « L'année a été dure, et vous en avez porté une grande partie. Merci. » est plus honnête que « Célébrons ensemble une autre année formidable! » Les gens font la différence, et ils se souviennent de celui qu'ils ont reçu.</p>

<p>C'est la même chose pour les personnes. La cliente qui a perdu un parent cet automne. L'employé revenu d'un congé de maladie en novembre. Votre colonne de faits repérera la plupart de ces situations. Pour ces personnes, oubliez le ton festif. Un mot discret et quelque chose de réconfortant se lisent comme de l'attention. Un « Ho ho ho » rouge et or se lit comme un publipostage.</p>

<h2>Trouvez la personne qui a fait le travail</h2>

<p>Du côté du client, le cadeau va habituellement au nom le plus haut placé du dossier. Mais la relation repose souvent sur quelqu'un d'autre : la coordonnatrice de projet qui a couru après chaque approbation, l'adjoint qui a trouvé une place dans un agenda impossible, la personne des comptes fournisseurs qui a veillé à ce que vos factures soient payées à temps.</p>

<p>Ajoutez-les à la liste. Ce sont les moins susceptibles de s'attendre à quelque chose et les plus susceptibles de s'en souvenir. Si leur organisation a une politique sur les cadeaux, un panier adressé à toute l'équipe permet de la respecter, et le <a href="/fr/guides/christmas-gifts-for-clients-employees-coworkers">guide des cadeaux de Noël au travail</a> explique comment.</p>

<h2>Gardez le logo discret</h2>

<p>La personne qui ouvre la boîte doit se sentir remerciée, pas sollicitée. Une carte à votre image suffit amplement. Des autocollants à logo sur chaque article, une brochure glissée sous le chocolat, une tasse avec le nom de l'entreprise en gros caractères : chacun de ces ajouts retransforme le remerciement en publicité. Si vous voulez que votre marque soit dans la boîte, mettez-la dans la signature. <a href="/fr/guides/corporate-gift-hampers-how-to-choose">Notre guide des paniers d'entreprise</a> en dit plus sur une image de marque qui ne prend pas toute la place.</p>

<h2>Ne le faites pas suivre d'un courriel de vente</h2>

<p>La façon la plus rapide de gâcher un beau cadeau, c'est un message le lendemain matin qui commence par « J'espère que vous avez aimé le panier! » et se termine par une question sur le prochain trimestre. Laissez le cadeau parler de lui-même. Si la personne vous écrit pour remercier, répondez comme un être humain. La conversation d'affaires peut attendre janvier, et elle s'en porte généralement mieux.</p>

<h2>Comment nous aidons pour la partie personnelle</h2>

<p>Pour les commandes d'entreprise, nous imprimons un message distinct pour chaque destinataire, ajoutons votre image de marque sur la carte si vous le souhaitez, livrons à chaque adresse de votre liste partout en Ontario et vous envoyons une seule facture. Les commandes en ligne vont jusqu'à dix paniers; au-delà, <a href="/fr/corporate/quote">envoyez-nous votre liste et votre budget</a> et nous répondons en un jour ouvrable. Les coffrets prêts à envoyer de notre <a href="/fr/corporate">page entreprise</a> sont là si vous êtes pressé, et vous pouvez aussi parcourir nos <a href="/fr/recipients/clients">cadeaux pour les clients</a> et nos <a href="/fr/recipients/employees">cadeaux pour les employés</a>.</p>

<p>Cinquante cadeaux, c'est beaucoup de boîtes. C'est aussi cinquante occasions de dire à quelqu'un que vous avez remarqué ce qu'il a fait cette année. Ça vaut bien un après-midi avec un tableur.</p>`,
  },
};

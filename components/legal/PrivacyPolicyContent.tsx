// components/legal/PrivacyPolicyContent.tsx
"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Database,
  Eye,
  Share2,
  Globe,
  Lock,
  Cookie,
  Clock,
  Trash2,
  UserCheck,
  Baby,
  FileText,
  Mail,
  ChevronRight,
  Printer,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";

/*
 * Privacy policy for the Earth Design website and the EDE Connect mobile app.
 *
 * Everything below describes what the code actually does (earthdesginapi +
 * eardesignmobile + this site). If you add a new service, a new kind of data
 * or a new tracker, update this text and LAST_UPDATED before you ship it —
 * Google Play and the App Store compare this page with the app.
 */

const LAST_UPDATED = { en: "20 October 2026", fr: "20 octobre 2026" };
const CONTACT_EMAIL = "realestate@earthdesignengineeringltd.com";
const CONTACT_PHONE = "+237 652 14 91 21";

type Lang = "en" | "fr";

type Block =
  | { p: string }
  | { list: (string | [string, string])[] }
  | { steps: string[] }
  | { note: string }
  | { h: string };

type Section = { id: string; icon: LucideIcon; title: string; blocks: Block[] };

type Copy = {
  badge: string;
  title: string;
  intro: string;
  updated: string;
  appliesTo: string;
  nav: string;
  print: string;
  back: string;
  sections: Section[];
};

const COPY: Record<Lang, Copy> = {
  en: {
    badge: "Your privacy matters",
    title: "Privacy Policy",
    intro:
      "How Earth Design collects, uses and protects your information on our website and in the EDE Connect app.",
    updated: "Last updated",
    appliesTo: "Applies to earthdesignengineeringltd.com and the EDE Connect app",
    nav: "On this page",
    print: "Print this policy",
    back: "Back to home",
    sections: [
      {
        id: "introduction",
        icon: FileText,
        title: "Who we are",
        blocks: [
          {
            p: "Earth Design Engineering SARL (Earth Design Engineering Ltd, \"Earth Design\", \"we\", \"us\"), registered in Yaoundé under no. RC/YAE/2023/B/2365, is a real estate, land survey and construction company based at Carrefour T.K.C, Yaoundé, Cameroon. We run the website earthdesignengineeringltd.com and the EDE Connect mobile app for Android and iPhone, where you can browse land, plots and buildings, save listings, and — if you are one of our agents — publish listings.",
          },
          {
            p: "The EDE Connect app is developed for us by unicomteam, which publishes it on Google Play on our behalf under our written authorization. Earth Design remains responsible for your personal information as described in this policy.",
          },
          {
            p: "This policy explains what information we collect, why, who helps us process it, how long we keep it, and the choices you have. It applies to both the website and the app.",
          },
          {
            note: "We do not sell your personal information, we do not show advertising, and we do not use your data to build advertising profiles.",
          },
        ],
      },
      {
        id: "information-collection",
        icon: Database,
        title: "Information we collect",
        blocks: [
          { h: "Information you give us" },
          {
            list: [
              ["Account details:", "your name, email address and password. Your password is stored only as a one-way encrypted hash — nobody at Earth Design can read it."],
              ["Profile details (optional):", "phone number, WhatsApp number, profile photo and a short bio. Agents can also add an agency name and logo."],
              ["Listings (agents only):", "descriptions, prices, photos, videos and the location of the property on the map."],
              ["Areas you follow:", "the centre point, distance and types of listing you want alerts for."],
              ["Messages to us:", "anything you send through our contact form, by email or on WhatsApp."],
            ],
          },
          { h: "Information collected when you use our services" },
          {
            list: [
              ["Saved listings:", "the listings you add to your favourites."],
              ["Views and shares:", "when a listing is opened or shared, we record which listing, the time, the app or website it came from, and for views the IP address and browser or device type. We use this to count views and prevent abuse."],
              ["Notification token:", "if you allow notifications, your phone gives us an anonymous token so we can send you alerts, plus whether it is Android or iPhone."],
              ["Language:", "the language you chose in the app, so we can show content in English or French."],
            ],
          },
          { h: "Phone permissions the app asks for" },
          {
            list: [
              ["Location:", "only while you use the app, to show listings near you and to place a listing on the map. We do not track your location in the background and we do not keep a history of where you have been."],
              ["Camera and photos:", "only to take or choose the pictures you decide to upload to a listing or your profile."],
              ["Notifications:", "only to send the alerts you switch on."],
            ],
          },
          {
            p: "You can refuse or withdraw any of these permissions in your phone's settings. The app keeps working; only the feature that needs that permission stops.",
          },
          {
            note: "We never ask for your national ID card, bank or card details, your contacts, or your messages.",
          },
        ],
      },
      {
        id: "how-we-use",
        icon: Eye,
        title: "How we use your information",
        blocks: [
          {
            list: [
              "To create and run your account, verify your email address with a one-time code and keep you signed in.",
              "To show listings, maps, search results and the listings you saved.",
              "To send the notifications you choose: when your listing is published or fails to upload, new listings in areas you follow, and important changes to your account.",
              "To let buyers and tenants contact the agent responsible for a listing.",
              "To show agents and our team how many people viewed or shared listings.",
              "To keep our services secure, prevent fraud and abuse, and comply with the law.",
              "To fix problems and improve the website and app.",
            ],
          },
          {
            p: "We process your information because it is needed to provide the service you asked for, because you consented (for example to location or notifications), to meet legal obligations, or for our legitimate interest in keeping our services safe and working well.",
          },
        ],
      },
      {
        id: "information-sharing",
        icon: Share2,
        title: "Who we share information with",
        blocks: [
          {
            p: "We share information only with the service providers that help us run Earth Design, and only what they need to do their job. They are not allowed to use it for their own purposes.",
          },
          {
            list: [
              ["Neon:", "hosts our database."],
              ["Amazon Web Services (AWS):", "hosts our servers."],
              ["Cloudinary:", "stores and delivers listing photos, videos and profile pictures."],
              ["EmailJS:", "sends verification codes and account emails to your email address."],
              ["Expo, Google Firebase Cloud Messaging and Apple Push Notification service:", "deliver notifications to your phone."],
              ["Google Maps Platform:", "displays maps and finds addresses in the app."],
            ],
          },
          { h: "Information that is public" },
          {
            p: "Listings are public. If you are an agent, the contact details you put on your profile (name, agency, phone, WhatsApp, photo) are shown on your listings so people can reach you. Regular users' details are never shown publicly.",
          },
          { h: "Legal reasons" },
          {
            p: "We may disclose information if the law, a court or a competent authority requires it, or to protect the rights and safety of our users or of Earth Design. If Earth Design is ever merged or sold, your information would move to the new owner under the same protections, and we would tell you first.",
          },
        ],
      },
      {
        id: "international-transfers",
        icon: Globe,
        title: "Where your information is stored",
        blocks: [
          {
            p: "Our service providers may store information on servers outside Cameroon, including in Europe and the United States. When this happens we choose providers that protect data with industry-standard security and contracts.",
          },
        ],
      },
      {
        id: "data-security",
        icon: Lock,
        title: "How we protect your information",
        blocks: [
          {
            list: [
              "All traffic between the app or website and our servers is encrypted (HTTPS).",
              "Passwords are stored as one-way hashes, never as plain text.",
              "In the app, your sign-in token is kept in your phone's secure storage.",
              "Access to personal data inside Earth Design is limited to staff who need it, with separate permissions for agents and administrators.",
            ],
          },
          {
            note: "No system is completely secure. Please use a strong password that you do not use elsewhere, and tell us straight away if you think your account has been misused.",
          },
        ],
      },
      {
        id: "cookies",
        icon: Cookie,
        title: "Cookies and data stored on your device",
        blocks: [
          {
            p: "Our website uses only the cookies needed to keep you signed in and to remember basic preferences. We do not use advertising or tracking cookies.",
          },
          {
            p: "The app does not use cookies. To work offline and load quickly, it saves listings you have viewed, your language choice and any listing you are still uploading on your phone. This stays on your device and is removed when you sign out or uninstall the app.",
          },
        ],
      },
      {
        id: "data-retention",
        icon: Clock,
        title: "How long we keep information",
        blocks: [
          {
            list: [
              ["Account and profile:", "for as long as your account exists. Deleted when you delete your account."],
              ["Saved listings, followed areas and notification tokens:", "deleted with your account. Notification tokens are also removed when you sign out or when your phone stops accepting notifications."],
              ["Email verification codes:", "expire after 10 minutes."],
              ["Views and shares:", "kept for statistics. When you delete your account they are kept only in anonymous form, no longer linked to you."],
              ["Listings posted by agents:", "remain part of our property catalogue after the agent's account is deleted, without the agent's name. Contact us if you want a listing removed."],
              ["Backups:", "deleted information may remain in encrypted backups for up to 30 days before it is overwritten."],
            ],
          },
        ],
      },
      {
        id: "delete-account",
        icon: Trash2,
        title: "Delete your account",
        blocks: [
          { h: "In the EDE Connect app" },
          {
            steps: [
              "Open the app and go to the Profile tab.",
              "Tap Delete my account at the bottom of the page.",
              "Enter your password and confirm.",
            ],
          },
          { p: "Your account is deleted immediately." },
          { h: "Without the app" },
          {
            p: `Email ${CONTACT_EMAIL} from the email address linked to your account, with the subject "Delete my account". We will confirm it is you and delete the account within 30 days.`,
          },
          {
            p: "Deleting your account removes your name, email, password, phone numbers, profile photo, saved listings, followed areas and notification tokens. Information kept afterwards is described in \"How long we keep information\" above.",
          },
        ],
      },
      {
        id: "your-rights",
        icon: UserCheck,
        title: "Your rights and choices",
        blocks: [
          {
            list: [
              ["See your information:", "ask us for a copy of the personal information we hold about you."],
              ["Correct it:", "edit your profile in the app or on the website at any time, or ask us to fix something."],
              ["Delete it:", "delete your account as described above."],
              ["Control notifications:", "choose which alerts you get in the app's Notifications settings, or turn them off in your phone's settings."],
              ["Withdraw permissions:", "turn off location, camera or photo access in your phone's settings."],
              ["Object or complain:", "contact us, and if you are not satisfied you may contact the competent data protection authority in Cameroon."],
            ],
          },
          {
            p: `To use any of these rights, email ${CONTACT_EMAIL}. We reply within 30 days.`,
          },
        ],
      },
      {
        id: "children",
        icon: Baby,
        title: "Children",
        blocks: [
          {
            p: "Our services are for adults looking to buy, rent or sell property. They are not meant for anyone under 18, and we do not knowingly collect information from children. If you believe a child has created an account, contact us and we will delete it.",
          },
        ],
      },
      {
        id: "updates",
        icon: FileText,
        title: "Changes to this policy",
        blocks: [
          {
            p: "We will update this page when our services or the law change, and change the date at the top. If a change significantly affects how we use your information, we will tell you in the app or by email before it takes effect.",
          },
        ],
      },
      {
        id: "contact",
        icon: Mail,
        title: "Contact us",
        blocks: [
          {
            list: [
              "Earth Design Engineering SARL (Earth Design Engineering Ltd)",
              "RC/YAE/2023/B/2365",
              "Carrefour T.K.C, Yaoundé, Cameroon",
              `Email: ${CONTACT_EMAIL}`,
              `Phone and WhatsApp: ${CONTACT_PHONE}`,
            ],
          },
        ],
      },
    ],
  },

  fr: {
    badge: "Votre vie privée compte",
    title: "Politique de confidentialité",
    intro:
      "Comment Earth Design collecte, utilise et protège vos informations sur notre site web et dans l'application EDE Connect.",
    updated: "Dernière mise à jour",
    appliesTo: "S'applique à earthdesignengineeringltd.com et à l'application EDE Connect",
    nav: "Sur cette page",
    print: "Imprimer cette politique",
    back: "Retour à l'accueil",
    sections: [
      {
        id: "introduction",
        icon: FileText,
        title: "Qui sommes-nous",
        blocks: [
          {
            p: "Earth Design Engineering SARL (Earth Design Engineering Ltd, « Earth Design », « nous »), immatriculée à Yaoundé sous le n° RC/YAE/2023/B/2365, est une entreprise d'immobilier, de topographie et de construction située au Carrefour T.K.C, Yaoundé, Cameroun. Nous exploitons le site earthdesignengineeringltd.com et l'application mobile EDE Connect pour Android et iPhone, où vous pouvez consulter des terrains, parcelles et bâtiments, enregistrer des annonces et — si vous êtes l'un de nos agents — publier des annonces.",
          },
          {
            p: "L'application EDE Connect est développée pour nous par unicomteam, qui la publie sur Google Play en notre nom, avec notre autorisation écrite. Earth Design reste responsable de vos informations personnelles comme décrit dans cette politique.",
          },
          {
            p: "Cette politique explique quelles informations nous collectons, pourquoi, qui nous aide à les traiter, combien de temps nous les conservons et quels choix vous avez. Elle s'applique au site web comme à l'application.",
          },
          {
            note: "Nous ne vendons pas vos informations personnelles, nous n'affichons pas de publicité et nous n'utilisons pas vos données pour établir des profils publicitaires.",
          },
        ],
      },
      {
        id: "information-collection",
        icon: Database,
        title: "Informations que nous collectons",
        blocks: [
          { h: "Informations que vous nous fournissez" },
          {
            list: [
              ["Compte :", "votre nom, votre adresse e-mail et votre mot de passe. Le mot de passe est conservé uniquement sous forme chiffrée irréversible — personne chez Earth Design ne peut le lire."],
              ["Profil (facultatif) :", "numéro de téléphone, numéro WhatsApp, photo de profil et courte présentation. Les agents peuvent aussi ajouter le nom et le logo de leur agence."],
              ["Annonces (agents uniquement) :", "descriptions, prix, photos, vidéos et emplacement du bien sur la carte."],
              ["Zones suivies :", "le point central, la distance et les types d'annonces pour lesquels vous voulez des alertes."],
              ["Messages :", "ce que vous nous envoyez via le formulaire de contact, par e-mail ou sur WhatsApp."],
            ],
          },
          { h: "Informations collectées lorsque vous utilisez nos services" },
          {
            list: [
              ["Annonces enregistrées :", "les annonces que vous ajoutez à vos favoris."],
              ["Consultations et partages :", "lorsqu'une annonce est ouverte ou partagée, nous enregistrons l'annonce, l'heure, l'application ou le site d'origine et, pour les consultations, l'adresse IP et le type de navigateur ou d'appareil. Cela nous sert à compter les vues et à prévenir les abus."],
              ["Jeton de notification :", "si vous autorisez les notifications, votre téléphone nous fournit un jeton anonyme pour vous envoyer des alertes, ainsi que le type d'appareil (Android ou iPhone)."],
              ["Langue :", "la langue choisie dans l'application, pour afficher le contenu en français ou en anglais."],
            ],
          },
          { h: "Autorisations demandées par l'application" },
          {
            list: [
              ["Position :", "uniquement pendant l'utilisation de l'application, pour afficher les annonces proches de vous et placer une annonce sur la carte. Nous ne suivons pas votre position en arrière-plan et ne conservons aucun historique de vos déplacements."],
              ["Appareil photo et photos :", "uniquement pour prendre ou choisir les images que vous décidez d'ajouter à une annonce ou à votre profil."],
              ["Notifications :", "uniquement pour envoyer les alertes que vous activez."],
            ],
          },
          {
            p: "Vous pouvez refuser ou retirer chacune de ces autorisations dans les réglages de votre téléphone. L'application continue de fonctionner ; seule la fonction concernée s'arrête.",
          },
          {
            note: "Nous ne demandons jamais votre carte nationale d'identité, vos coordonnées bancaires, vos contacts ni vos messages.",
          },
        ],
      },
      {
        id: "how-we-use",
        icon: Eye,
        title: "Utilisation de vos informations",
        blocks: [
          {
            list: [
              "Créer et gérer votre compte, vérifier votre adresse e-mail par un code à usage unique et vous garder connecté.",
              "Afficher les annonces, cartes, résultats de recherche et vos annonces enregistrées.",
              "Envoyer les notifications que vous choisissez : publication ou échec d'envoi de votre annonce, nouvelles annonces dans les zones suivies et changements importants sur votre compte.",
              "Permettre aux acheteurs et locataires de contacter l'agent responsable d'une annonce.",
              "Indiquer aux agents et à notre équipe combien de personnes ont consulté ou partagé les annonces.",
              "Assurer la sécurité de nos services, prévenir la fraude et les abus et respecter la loi.",
              "Corriger les problèmes et améliorer le site et l'application.",
            ],
          },
          {
            p: "Nous traitons vos informations parce qu'elles sont nécessaires au service demandé, parce que vous y avez consenti (par exemple pour la position ou les notifications), pour respecter nos obligations légales, ou dans notre intérêt légitime à garder nos services sûrs et fonctionnels.",
          },
        ],
      },
      {
        id: "information-sharing",
        icon: Share2,
        title: "Avec qui nous partageons vos informations",
        blocks: [
          {
            p: "Nous partageons des informations uniquement avec les prestataires qui nous aident à faire fonctionner Earth Design, et seulement ce dont ils ont besoin. Ils n'ont pas le droit de les utiliser à leurs propres fins.",
          },
          {
            list: [
              ["Neon :", "héberge notre base de données."],
              ["Amazon Web Services (AWS) :", "héberge nos serveurs."],
              ["Cloudinary :", "stocke et diffuse les photos, vidéos d'annonces et photos de profil."],
              ["EmailJS :", "envoie les codes de vérification et les e-mails liés au compte."],
              ["Expo, Google Firebase Cloud Messaging et Apple Push Notification service :", "acheminent les notifications vers votre téléphone."],
              ["Google Maps Platform :", "affiche les cartes et recherche les adresses dans l'application."],
            ],
          },
          { h: "Informations publiques" },
          {
            p: "Les annonces sont publiques. Si vous êtes agent, les coordonnées de votre profil (nom, agence, téléphone, WhatsApp, photo) apparaissent sur vos annonces afin qu'on puisse vous joindre. Les informations des utilisateurs ordinaires ne sont jamais rendues publiques.",
          },
          { h: "Raisons légales" },
          {
            p: "Nous pouvons communiquer des informations si la loi, un tribunal ou une autorité compétente l'exige, ou pour protéger les droits et la sécurité de nos utilisateurs ou d'Earth Design. Si Earth Design venait à être fusionnée ou vendue, vos informations seraient transférées au nouveau propriétaire avec les mêmes protections, et nous vous en informerions au préalable.",
          },
        ],
      },
      {
        id: "international-transfers",
        icon: Globe,
        title: "Où vos informations sont stockées",
        blocks: [
          {
            p: "Nos prestataires peuvent stocker des informations sur des serveurs situés hors du Cameroun, notamment en Europe et aux États-Unis. Dans ce cas, nous choisissons des prestataires qui protègent les données par des mesures de sécurité et des contrats conformes aux normes du secteur.",
          },
        ],
      },
      {
        id: "data-security",
        icon: Lock,
        title: "Protection de vos informations",
        blocks: [
          {
            list: [
              "Toutes les communications entre l'application ou le site et nos serveurs sont chiffrées (HTTPS).",
              "Les mots de passe sont conservés sous forme chiffrée irréversible, jamais en clair.",
              "Dans l'application, votre jeton de connexion est conservé dans le stockage sécurisé de votre téléphone.",
              "Au sein d'Earth Design, l'accès aux données personnelles est limité au personnel qui en a besoin, avec des droits distincts pour les agents et les administrateurs.",
            ],
          },
          {
            note: "Aucun système n'est totalement sûr. Utilisez un mot de passe solide que vous n'utilisez nulle part ailleurs et prévenez-nous immédiatement si vous pensez que votre compte a été utilisé à votre insu.",
          },
        ],
      },
      {
        id: "cookies",
        icon: Cookie,
        title: "Cookies et données stockées sur votre appareil",
        blocks: [
          {
            p: "Notre site utilise uniquement les cookies nécessaires pour vous garder connecté et mémoriser des préférences de base. Nous n'utilisons pas de cookies publicitaires ni de suivi.",
          },
          {
            p: "L'application n'utilise pas de cookies. Pour fonctionner hors connexion et se charger rapidement, elle enregistre sur votre téléphone les annonces consultées, votre choix de langue et les annonces en cours d'envoi. Ces données restent sur votre appareil et sont supprimées lorsque vous vous déconnectez ou désinstallez l'application.",
          },
        ],
      },
      {
        id: "data-retention",
        icon: Clock,
        title: "Durée de conservation",
        blocks: [
          {
            list: [
              ["Compte et profil :", "tant que votre compte existe. Supprimés lorsque vous supprimez votre compte."],
              ["Annonces enregistrées, zones suivies et jetons de notification :", "supprimés avec votre compte. Les jetons de notification sont aussi supprimés à la déconnexion ou lorsque votre téléphone n'accepte plus les notifications."],
              ["Codes de vérification par e-mail :", "expirent après 10 minutes."],
              ["Consultations et partages :", "conservés à des fins statistiques. Après la suppression de votre compte, ils ne sont conservés que sous forme anonyme, sans lien avec vous."],
              ["Annonces publiées par les agents :", "restent dans notre catalogue après la suppression du compte de l'agent, sans le nom de celui-ci. Contactez-nous si vous souhaitez qu'une annonce soit retirée."],
              ["Sauvegardes :", "les informations supprimées peuvent subsister jusqu'à 30 jours dans des sauvegardes chiffrées avant d'être écrasées."],
            ],
          },
        ],
      },
      {
        id: "delete-account",
        icon: Trash2,
        title: "Supprimer votre compte",
        blocks: [
          { h: "Dans l'application EDE Connect" },
          {
            steps: [
              "Ouvrez l'application et allez dans l'onglet Profil.",
              "Touchez Supprimer mon compte en bas de la page.",
              "Saisissez votre mot de passe et confirmez.",
            ],
          },
          { p: "Votre compte est supprimé immédiatement." },
          { h: "Sans l'application" },
          {
            p: `Écrivez à ${CONTACT_EMAIL} depuis l'adresse e-mail liée à votre compte, avec pour objet « Supprimer mon compte ». Nous vérifierons votre identité et supprimerons le compte sous 30 jours.`,
          },
          {
            p: "La suppression efface votre nom, votre e-mail, votre mot de passe, vos numéros de téléphone, votre photo de profil, vos annonces enregistrées, vos zones suivies et vos jetons de notification. Les informations conservées ensuite sont décrites dans « Durée de conservation » ci-dessus.",
          },
        ],
      },
      {
        id: "your-rights",
        icon: UserCheck,
        title: "Vos droits et vos choix",
        blocks: [
          {
            list: [
              ["Accéder à vos informations :", "demandez-nous une copie des informations personnelles que nous détenons sur vous."],
              ["Les corriger :", "modifiez votre profil dans l'application ou sur le site à tout moment, ou demandez-nous de corriger une information."],
              ["Les supprimer :", "supprimez votre compte comme indiqué ci-dessus."],
              ["Gérer les notifications :", "choisissez vos alertes dans les réglages Notifications de l'application, ou désactivez-les dans les réglages du téléphone."],
              ["Retirer des autorisations :", "désactivez l'accès à la position, à l'appareil photo ou aux photos dans les réglages du téléphone."],
              ["Vous opposer ou réclamer :", "contactez-nous et, si vous n'êtes pas satisfait, vous pouvez saisir l'autorité camerounaise compétente en matière de protection des données."],
            ],
          },
          {
            p: `Pour exercer l'un de ces droits, écrivez à ${CONTACT_EMAIL}. Nous répondons sous 30 jours.`,
          },
        ],
      },
      {
        id: "children",
        icon: Baby,
        title: "Enfants",
        blocks: [
          {
            p: "Nos services s'adressent aux adultes qui souhaitent acheter, louer ou vendre un bien. Ils ne sont pas destinés aux moins de 18 ans et nous ne collectons pas sciemment d'informations sur des enfants. Si vous pensez qu'un enfant a créé un compte, contactez-nous et nous le supprimerons.",
          },
        ],
      },
      {
        id: "updates",
        icon: FileText,
        title: "Modifications de cette politique",
        blocks: [
          {
            p: "Nous mettrons cette page à jour lorsque nos services ou la loi évolueront, et modifierons la date en haut de page. Si un changement affecte sensiblement l'utilisation de vos informations, nous vous en informerons dans l'application ou par e-mail avant son entrée en vigueur.",
          },
        ],
      },
      {
        id: "contact",
        icon: Mail,
        title: "Nous contacter",
        blocks: [
          {
            list: [
              "Earth Design Engineering SARL (Earth Design Engineering Ltd)",
              "RCCM n° RC/YAE/2023/B/2365",
              "Carrefour T.K.C, Yaoundé, Cameroun",
              `E-mail : ${CONTACT_EMAIL}`,
              `Téléphone et WhatsApp : ${CONTACT_PHONE}`,
            ],
          },
        ],
      },
    ],
  },
};

/** Turns the contact email and phone inside plain text into tappable links. */
function linkify(text: string): ReactNode {
  const escape = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(${escape(CONTACT_EMAIL)}|${escape(CONTACT_PHONE)})`, "g");
  return text.split(pattern).map((part, i) => {
    if (part === CONTACT_EMAIL) {
      return (
        <a key={i} href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-teal-700 underline underline-offset-2 break-all">
          {part}
        </a>
      );
    }
    if (part === CONTACT_PHONE) {
      return (
        <a key={i} href={`tel:${CONTACT_PHONE.replace(/ /g, "")}`} className="font-medium text-teal-700 underline underline-offset-2">
          {part}
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function renderBlock(block: Block, key: number) {
  if ("h" in block) {
    return (
      <h3 key={key} className="text-base font-semibold text-gray-900 mt-6 mb-2 first:mt-0">
        {block.h}
      </h3>
    );
  }
  if ("p" in block) {
    return (
      <p key={key} className="text-gray-600 leading-relaxed mt-3 first:mt-0">
        {linkify(block.p)}
      </p>
    );
  }
  if ("note" in block) {
    return (
      <div key={key} className="mt-4 p-4 bg-teal-50 border border-teal-100 rounded-xl text-sm text-teal-900 leading-relaxed">
        {linkify(block.note)}
      </div>
    );
  }
  if ("steps" in block) {
    return (
      <ol key={key} className="mt-2 space-y-2">
        {block.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3 text-gray-600">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span className="leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <ul key={key} className="mt-2 space-y-2.5">
      {block.list.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-gray-600 leading-relaxed">
          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2.5 flex-shrink-0" />
          <span>
            {Array.isArray(item) ? (
              <>
                <strong className="text-gray-900 font-semibold">{item[0]}</strong> {linkify(item[1])}
              </>
            ) : (
              linkify(item)
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicyContent() {
  const [lang, setLang] = useState<Lang>("en");

  // ?lang=fr (used by the app) wins, then the browser's language.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (fromUrl === "fr" || fromUrl === "en") setLang(fromUrl);
    else if (navigator.language?.toLowerCase().startsWith("fr")) setLang("fr");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = COPY[lang];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="bg-brand-hero relative pt-10 pb-16 md:pt-14 md:pb-20 overflow-hidden print:bg-none print:py-6">
        <div className="absolute inset-0 overflow-hidden print:hidden">
          <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 mb-10 print:hidden">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {t.back}
            </Link>
            <div role="group" aria-label="Language" className="inline-flex p-1 bg-white/10 border border-white/15 rounded-full">
              {(["en", "fr"] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    lang === l ? "bg-white text-gray-900" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {l === "en" ? "English" : "Français"}
                </button>
              ))}
            </div>
          </div>

          <motion.div
            key={lang}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-teal-300 text-sm font-medium mb-6 print:hidden">
              <Shield className="w-4 h-4" />
              <span>{t.badge}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-5 print:text-gray-900">{t.title}</h1>
            <p className="text-base md:text-lg text-gray-300 mb-6 max-w-2xl mx-auto print:text-gray-700">{t.intro}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-sm text-gray-400">
              <span className="inline-flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t.updated}: {LAST_UPDATED[lang]}
              </span>
              <span className="hidden sm:block">•</span>
              <span>{t.appliesTo}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Table of contents */}
          <aside className="lg:w-72 flex-shrink-0 print:hidden">
            <div className="lg:sticky lg:top-24">
              <details className="group lg:hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
                <summary className="flex items-center justify-between px-5 py-4 font-semibold text-gray-900 cursor-pointer list-none">
                  {t.nav}
                  <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                </summary>
                <nav className="px-3 pb-3 space-y-0.5">
                  {t.sections.map((s, i) => (
                    <a key={s.id} href={`#${s.id}`} className="block px-3 py-2 text-sm text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg">
                      {i + 1}. {s.title}
                    </a>
                  ))}
                </nav>
              </details>

              <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
                <h2 className="font-bold text-gray-900 mb-3 px-2">{t.nav}</h2>
                <nav className="space-y-0.5">
                  {t.sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="flex items-center gap-3 px-2 py-2 text-sm text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors group"
                    >
                      <s.icon className="w-4 h-4 text-gray-400 group-hover:text-teal-600 flex-shrink-0" />
                      <span>{s.title}</span>
                    </a>
                  ))}
                </nav>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    {t.print}
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Policy */}
          <article className="flex-1 min-w-0 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 md:p-12 print:shadow-none print:border-0 print:p-0">
            {t.sections.map((section, i) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 pb-10 mb-10 border-b border-gray-100 last:border-0 last:pb-0 last:mb-0"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 print:hidden">
                    <section.icon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    {i + 1}. {section.title}
                  </h2>
                </div>
                {section.blocks.map(renderBlock)}
              </section>
            ))}
          </article>
        </div>
      </div>
    </div>
  );
}

# Varna Pot 

**Mobilna aplikacija za izboljšanje prometne varnosti in informiranosti v realnem času.**

## Namen aplikacije

Varna Pot je mobilna aplikacija, ki uporabnikom omogoča:
- poročanje o prometnih nesrečah,
- pregled preko interaktivnega zemljevida,
- nalaganje fotografij z mesta dogodka,
- spremljanje lokacije in sprejemanje opozoril,
- preverjanje in ocenjevanje verodostojnosti vnosov s strani skupnosti,
- avtomatsko preverjanje koordinat (z vključeno omejitvijo na Slovenijo).

Aplikacija je posebej koristna za:
- osebne in poklicne voznike,
- reševalne službe (hitrejše odzivanje na nesreče),
- voznike, ki se gibljejo po nevarnih križiščih.

## Ključne funkcionalnosti

### Avtentikacija
- Firebase Authentication
- Podpora za prijavo in registracijo
- Onboarding za nove uporabnike

### Upravljanje pinov (markerjev)
- Dodajanje novega pina (naslov, opis, slika, geolokacija, kategorija)
- Urejanje in brisanje obstoječih pinov
- Samodejna pretvorba naslova v koordinate prek OpenStreetMap/Nominatim
- Validacija lokacije (znotraj Slovenije)

### Interaktivni zemljevid
- Prikaz vseh odobrenih pinov v WebView-ju (Leaflet.js)
- Geolokacija uporabnika in prikaz njegove trenutne pozicije

### Slike dogodkov
- Uporabniki lahko posnamejo ali naložijo slike
- Slike se prikažejo znotraj zemljevida in v podrobnostih pina

### Recenzija vsebin
- Admini lahko pin potrjujejo ali zavračajo
- Uporabniki vidijo samo potrjene vsebine

## Tehnologije

| Tehnologija           | Namen                                 |
|------------------------|----------------------------------------|
| React Native           | Mobilna aplikacija                     |
| Firebase Auth          | Avtentikacija uporabnikov              |
| Firebase Firestore     | Shranjevanje pinov in uporabniških profilov |
| OpenStreetMap/Nominatim | Geokodiranje naslovov v koordinate     |
| Leaflet.js + WebView   | Prikaz interaktivnega zemljevida       |
| react-native-image-picker | Uporaba kamere in galerije za slike   |

## Arhitektura

- **Login/Register**: Firebase Auth
- **AddPinScreen / EditPinScreen**: Upravljanje pinov
- **MapScreen**: WebView z zemljevidom in markerji
- **PinListScreen**: Seznam uporabnikovih pinov
- **PinDetailScreen**: Podrobnosti pina z možnostjo odobritve/zavrnitve
- **SettingsScreen**: Nastavitve (npr. zgodovina, profil, emergency)
- **TakePicture**: Komponenta za kamero in nalaganje slik

## Kategorije pinov

- Traffic accident
- Traffic jam
- Natural disaster
- High Pedestrian Activity
- Construction Zone
- Dangerous road condition
- Other

## Navodila za zagon (Android)

1. `git clone <repo-url>`
2. `cd varna-pot`
3. `npm install`
4. `npx react-native run-android`

**Pogoji:**
- nameščena `Android Studio` in emulator ali fizična naprava
- Firebase konfiguracija (`google-services.json`)
- ustrezne pravice za kamero, lokacijo in shranjevanje

## Firebase struktura

### Kolekcija: `users`
```json
{
  "email": "user@example.com",
  "username": "Janez",
  "admin": false,
  "onboarding": true,
  "createdAt": <timestamp>
}
```
### Kolekcija: `pin`
```json
{
  "title": "Fallen tree on road",         
  "description": "Large tree blocking both lanes", 
  "category": "Natural disaster",         
  "street": "Glavna cesta 123",           
  "city": "Ljubljana",                    
  "longitude": "14.5058",                 
  "latitude": "46.0569",                  
  "userId": "user@example.com",           
  "review": "pending",                   
  "image": "<url ali base64 string>",     
  "createdAt": <timestamp>,               
  "updatedAt": <timestamp>  
}
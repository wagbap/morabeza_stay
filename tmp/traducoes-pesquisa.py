from pathlib import Path
import json
values={
'pt':['O que procuras?','Selecionar serviço','Escolhe alojamento, carro ou experiência para pesquisar.'],
'en':['What are you looking for?','Select a service','Choose accommodation, a car or an experience to search.'],
'fr':['Que recherchez-vous ?','Choisir un service','Choisissez un hébergement, une voiture ou une expérience.'],
'es':['¿Qué buscas?','Seleccionar servicio','Elige alojamiento, coche o experiencia para buscar.'],
'de':['Was suchst du?','Service auswählen','Wähle Unterkunft, Auto oder Erlebnis für deine Suche.'],
'ir':['Cosa cerchi?','Seleziona un servizio','Scegli un alloggio, un’auto o un’esperienza da cercare.'],
'cv':['Kuzê ki bu ta procura?','Skodje un servisu','Skodje alojamentu, karu ô speriénsia pa pesquisa.'],
}
for lang,items in values.items():
 p=Path('src/locales')/(lang+'.js');s=p.read_text(encoding='utf-8');keys=['home_pesquisa_servico','home_pesquisa_selecionar','home_pesquisa_escolha'];s=s.replace('export default {','export default {\n'+''.join('  '+k+': '+json.dumps(v,ensure_ascii=False)+',\n' for k,v in zip(keys,items)),1);p.write_text(s,encoding='utf-8')

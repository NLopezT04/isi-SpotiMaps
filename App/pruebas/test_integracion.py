import requests
import base64
import math
import sys

# Se requiere la instalación de las siguiente libreria:
# pip install requests
# Comprobar tener permisos de ejecución
# Se ejecuta : python3 .\test_integracion.py


def geoapify(longitud, latitud):
    print('Test Geoapify: \n')
    url = "https://geoapify-platform.p.rapidapi.com/v1/geocode/reverse"
    querystring = {"apiKey":"0b8dffcbecc84716ab11d5ac53f8caf5","lon":longitud,"lat":latitud,"lang":"en","limit":"1"}

    headers = {
	    "X-RapidAPI-Host": "geoapify-platform.p.rapidapi.com",
    	"X-RapidAPI-Key": "6acf691c34mshb3d77ba0325f211p163cd2jsn26be24d53894"
    }

    response = requests.request("GET", url, headers=headers, params=querystring)
    print(response.text)

    #Llamar ticketmaster para conciertos
    json = response.json()
    countryGeoapify=(json['features'][0]["properties"]["country_code"])
    ticketmaster(countryGeoapify)





def ticketmaster(countryGeoapify):
    print('\n\n\n\n\nTest Ticketmaster: \n')
    events_url = f'https://app.ticketmaster.com/discovery/v2/events.json'
    musician_name= ''
    response = requests.get(events_url, params={
        'countryCode': countryGeoapify,
        'classificationName': 'Musician',
        'page': '1',
        'size': '1',
        'sort': 'relevance,desc',
        'apikey': 'NVOQ1LlrFNB0eQ42mesPgp9sBydEnbay'
    })

    json = response.json()

    if '_embedded' in json:
        print(response)
        print(response.json()['_embedded']['events'])
        events = response.json()['_embedded']['events']
        for event in events:
            for attraction in event['_embedded']['attractions']:
                musician_name = attraction['name']
                spotify(musician_name)

        return response.json()['_embedded']['events']
    else:
        return []


def spotify(Cantante):
    print('\n\n\n\n\nTest Spotify: \n')
    url = "https://spotify23.p.rapidapi.com/search/"

    querystring = {"q":Cantante,"type":"playlists","offset":"0","limit":"10","numberOfTopResults":"5"}

    headers = {
    	"X-RapidAPI-Host": "spotify23.p.rapidapi.com",
    	"X-RapidAPI-Key": "6acf691c34mshb3d77ba0325f211p163cd2jsn26be24d53894"
    }

    response = requests.request("GET", url, headers=headers, params=querystring)

    print(response.text)


if __name__ == "__main__":
    print('Inicio del test: \n')

    print('\n\n\n\n\nTest 1 España: \n')
    geoapify(-3.5268824, 39.946262)

    print('\n\n\n\n\nTest 2 Reino unido: \n')
    geoapify(-1.3898056, 52.4885148)

    print('\n\n\n\n\nTest 3 Italia: \n')
    geoapify(9.525267, 51.628687)
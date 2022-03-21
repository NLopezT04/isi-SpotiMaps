import requests
import base64
import pandas as pd
import math
import sys

def spotify(client_id,client_secret , str_artist):
    token = get_token(client_id,client_secret)
    header = {'Authorization': f'Bearer {token}'};
    artist_id = get_artist(str_artist,header)
    list_discography = get_discography(artist_id,header);
    get_tracks(list_discography, header,artist_id)


def get_artist(str_artist,header):
    url_busqueda = "https://api.spotify.com/v1/search";
    search_params = {'q': f'{str_artist}', 'type': 'artist', 'market': 'US'};
    busqueda = requests.get(url_busqueda, headers=header, params=search_params);
    if busqueda.status_code != 200:
        print('Error en la request ', busqueda.json())
        return None
    resultado = busqueda.json()
    artists = resultado['artists']['items']
    artists_data = pd.DataFrame(artists)
    artist = artists_data.sort_values(by="popularity", ascending=False).iloc[0]

    artist.to_csv('artist.csv')
    artist_id = artist['id']

    return artist_id

def get_discography(artist_id ,header,offset = 0,limit = 30):
    list_discography= [];
    url_discography = f'https://api.spotify.com/v1/artists/{artist_id}/albums';
    albums = requests.get(url_discography, headers=header)
    total = albums.json()['total']
    pages = math.ceil(total/limit)
    for i in range (0,pages):
        params = {'country': 'PE', 'offset': offset, 'limit': limit};
        albums = requests.get(url_discography, headers=header, params=params)
        if albums.status_code != 200:
            print('Error en la request ', albums.json())
            return None
        albums = albums.json()['items']
        for album in albums:
            list_discography.append(album)
        offset = offset + limit

    return list_discography;

def get_tracks(list_discography , header, artist_id):
    list_tracks = []
    for discography in list_discography:
        discography_id = discography['id']
        discography['track_artist'] = 0
        url_tracks = f'https://api.spotify.com/v1/albums/{discography_id}/tracks'
        params = {'market': 'PE', 'offset': 0, 'limit': 50};
        tracks = requests.get(url_tracks, headers=header, params=params)
        tracks = tracks.json()['items']
        for track in tracks:
            print(track)
            if track['artists'][0]['id'] == artist_id:
                discography['track_artist'] = discography['track_artist'] +1
                track['discography_id']= discography_id
                list_tracks.append(track)

    discography = pd.DataFrame(list_discography)
    discography.to_csv('discography.csv')
    tracks_data = pd.DataFrame(list_tracks)
    tracks_data.to_csv('tracks.csv')

    return list_tracks


def get_token(client_id,client_secret):
    client_str = f'{client_id}:{client_secret}'
    # codificando en bytes
    client_encode = base64.b64encode(client_str.encode("utf-8"))
    # codificando en string
    client_encode = str(client_encode, "utf-8")
    token_url = 'https://accounts.spotify.com/api/token'
    params = {'grant_type': 'client_credentials'}
    headers = {'Authorization': f'Basic {client_encode}'}
    p = requests.post(token_url, data=params, headers=headers)
    if p.status_code != 200:
        print('Error en la request ', p.json())
        return None
    token = p.json()['access_token']
    return token

if __name__ == "__main__":
    client_id = '5b958756724b469ba722bff8f1ffa180'
    client_secret = 'e025198df42346a89534bde0b03c6d68'
    artist = input("Artista: ")
        #artist = input("Artista: ")
    artist = sys.argv[1]
    spotify(client_id, client_secret, artist)








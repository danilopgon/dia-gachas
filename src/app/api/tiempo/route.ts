import { NextRequest, NextResponse } from 'next/server';
import { IWeatherRequest } from '@/app/interfaces/IWeatherRequest';

export async function POST(request: NextRequest) {
  if (!request.body) {
    return NextResponse.json({ message: 'No body provided' }, { status: 400 });
  }

  const { provinceCode, cityCode } = (await request.json()) as IWeatherRequest;

  if (!cityCode) {
    return NextResponse.json(
      { message: 'No city code provided' },
      { status: 400 }
    );
  }

  var myHeaders = new Headers();
  myHeaders.append('api_key', process.env.AEMET_API_KEY || '');

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
  };

  return fetch(
    `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/${provinceCode}${cityCode}`,
    {
      ...requestOptions,
      redirect: 'follow',
    }
  )
    .then((res) => res.json())
    .then((data) => {
      return fetch(data.datos)
        .then((res) => res.json())
        .then((innerData) => {
          return NextResponse.json({ data: innerData }, { status: 200 });
        });
    })
    .catch((error) => {
      return NextResponse.json(
        { message: 'Error fetching data: ' + error },
        { status: 500 }
      );
    });
}

import { Component, ElementRef, ViewChild } from '@angular/core';
import { LngLat, Map, Marker } from 'mapbox-gl';

interface MarkerAndColor{
  color:string,
  marker:Marker,
}

interface PlainMarker{
  color:string;
  lngLat:number[];
}

@Component({
  templateUrl: './markers-page.component.html',
  styleUrls: ['./markers-page.component.css']
})
export class MarkersPageComponent {
  @ViewChild('map') divMap?: ElementRef;

  public markers: MarkerAndColor[]=[];



  public map?:Map;

  public currentLngLat: LngLat = new LngLat( -16.56, 28.22)


  ngAfterViewInit(): void {
    if(!this.divMap) throw 'El elemento html no fue encontrado';

    this.map = new Map({
      container: this.divMap?.nativeElement, // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: this.currentLngLat, // starting position [lng, lat]
      zoom: 13, // starting zoom
    });

  //   const markerHtml = document.createElement('img');
  //   markerHtml.style.width = '40px';
  //   markerHtml.src = './../../assets/HHT0RntvuHZk.jpg'

  //   const marker = new Marker({
  //     color:'red',
  //     element:markerHtml,

  //   })
  //   .setLngLat(this.currentLngLat)
  //   .addTo(this.map)
  this.readFromlocalStorage();
  }
  createMarker(){
    if(!this.map) return;
    const color = '#xxxxxx'.replace(/x/g, y=>(Math.random()*16|0).toString(16));
    const lngLat = this.map.getCenter();
    this.addMarker(lngLat,color);
  }

  addMarker(lngLat:LngLat, color:string){
    if(!this.map) return;

    const marker = new Marker({
      color:color,
      draggable:true
    }).setLngLat(lngLat)
    .addTo(this.map)

    this.markers.push({
      color,
      marker
    });
    this.saveToLocalStorage();
    marker.on('dragend', () =>{
      this.saveToLocalStorage();

    })
  }


  deleteMarker(index:number){
    this.markers[index].marker.remove();
    this.markers.splice(index,1);
    this.saveToLocalStorage();

  }

  flyTo(marker:Marker){
    this.map?.flyTo({
      zoom:14,
      center: marker.getLngLat()
    })
  }

  saveToLocalStorage(){
    const plainMarker: PlainMarker[] = this.markers.map(({color,marker})=>{
      return {
        color,
        lngLat: marker.getLngLat().toArray()
      }
    })
    localStorage.setItem('plainMarkers', JSON.stringify(plainMarker));

  }

  readFromlocalStorage(){
    const plainMarkersString = localStorage.getItem('plainMarkers') ?? '[]';
    const plainMarkers:PlainMarker[] = JSON.parse(plainMarkersString);
    console.log(plainMarkers);

    plainMarkers.forEach(({color, lngLat}) => {
      const [lng,lat] = lngLat;
      const coords = new LngLat(lng,lat);
      this.addMarker(coords,color);
    })

  }
}

import { useEffect, useRef } from "react";
import { renderToString } from 'react-dom/server';

const DEFAULT_CENTER = { lat: 22.279909, lng: 114.173729 };
const DEFAULT_ZOOM = 9;
var map : google.maps.Map
var infowindow : google.maps.InfoWindow
var arrMarkers : google.maps.Marker[]

var styleInfoview = {
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
} as const

export const GoogleMaps = ({
  height,
  markers,
  mapId,
  className,
  selectedUser,
}: {
  height?: number;
  markers: ReadonlyArray<google.maps.Marker>;
  mapId?: string;
  className?: string;
  selectedUser?: any
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
      // init map
    if (ref.current) {

      if (map === undefined) {
        map = new window.google.maps.Map(ref.current, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          mapId,
        });
        infowindow = new google.maps.InfoWindow({
          content: ""
        });
      }
      
      // set map to marker
      arrMarkers = markers.map((marker) => {
        marker.setMap(map)
        return marker;
      });
      
      // zoom out for all markers
      if (arrMarkers.length>0) {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < arrMarkers.length; i++) {
          bounds.extend(arrMarkers[i].getPosition()!);
        }
        map.fitBounds(bounds);
      } 

    }
  }, [ref, mapId, markers]);

  // on listview clicked call this
  useEffect(()=>{

    if (selectedUser?.marker!=null) {
      // on click pan to location
      let position = selectedUser.marker.getPosition()
      map.panTo({lat: position!.lat(), lng: position!.lng()})
      map.setZoom(12)

      // show infoview
      var content = renderToString(
        <div style={styleInfoview}>
          <img style={{maxWidth:"120px"}} src={selectedUser.picture}/>
          <p style={{textAlign: "center"}}>{selectedUser.name.first} {selectedUser.name.last}</p>
        </div>
      )
      infowindow.setContent(content)
      infowindow.open(map, selectedUser.marker)

    } else if (infowindow!=null){
      // no one being selected. close
      infowindow.close()
    }
  }, [selectedUser])
  return (
    <div
      className={className}
      ref={ref}
      style={{ width: "100%", height: height || "30vh" }}
    />
  );
};

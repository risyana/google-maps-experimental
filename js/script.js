/* CONSTANT */
const ATTRACTIONS = '../data/data.json';
const LAT_LNG = [1.2922997, 103.8571885];
const ZOOM_IN = 17;
const ZOOM_INIT = 15;

/* MODEL */
const data = {
  dataGlobal: '', // data from json file
  mapGlobal: '', // google maps
  markersGlobal: '', // google maps markers
  mapCenterGlobal: '', // default center of goole maps
  markerIcon: '',
  markerIconBigger: '',
};

/* OCTOPUS */
const controller = {

  setAttractionData: () => {
    fetch(ATTRACTIONS)
      .then(response => response.json())
      .then((result) => {
        data.dataGlobal = result.data;
      });
  },

  getAttractionData: () => data.dataGlobal,

  getDetailAttraction: (id) => {
    const selectedMarker = data.markersGlobal.filter((marker) => {
      return marker.id === id.toString();
    });

    data.mapGlobal.setCenter(selectedMarker[0].marker.getPosition());
    data.mapGlobal.setZoom(ZOOM_IN);

    const attr = data.dataGlobal.filter((attraction) => {
      return attraction.id === id.toString();
    });
    return attr[0];
  },

  createMap: () => {
    const mapProp = {
      zoom: ZOOM_INIT,
      center: data.mapCenterGlobal,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };
    return new google.maps.Map(document.getElementById('maps'), mapProp);
  },

  createMarker: () => {
    return data.dataGlobal.map((elm) => {
      const markerProp = {
        map: data.mapGlobal,
        position: new google.maps.LatLng(elm.loc.lat, elm.loc.lng),
        icon: data.markerIcon,
        labelContent: elm.name,
        labelAnchor: new google.maps.Point(12, 44),
        labelClass: 'marker_label_default', // your desired CSS class
        labelInBackground: true,
      };

      // handling IE 11 & Edge if user press 'reload' button in the browser.
      if (typeof MarkerWithLabel === 'undefined') {
        window.location.href = window.location.href;
      }

      return {
        id: elm.id,
        marker: new MarkerWithLabel(markerProp),
      };
    });
  },

  setListenerToMarkers: () => {
    data.markersGlobal.forEach((elm) => {
      const { marker } = elm;
      marker.addListener('click', () => {
        data.mapGlobal.setZoom(ZOOM_IN);
        data.mapGlobal.setCenter(marker.getPosition());
        view.displayDetailAttraction(elm.id);
      });
      marker.addListener('mouseover', () => {
        marker.set('icon', data.markerIconBigger);
        marker.set('labelClass', 'marker_label_mouseover');
        marker.set('labelAnchor', new google.maps.Point(25, 100));
      });
      marker.addListener('mouseout', () => {
        marker.set('icon', data.markerIcon);
        marker.set('labelClass', 'marker_label_default');
        marker.set('labelAnchor', new google.maps.Point(12, 44));
      });
    });
  },

  init: () => {
    controller.setAttractionData();
    setTimeout(() => {
      view.render();
    }, 1000);
  },
};

/* VIEW */
const view = {

  displayAttractions: () => {
    const linkContainer = document.querySelector('.attraction-list');
    const linkTemplate = document.querySelector('script[data-template="attraction"]').innerHTML;

    const attractions = controller.getAttractionData();

    attractions.forEach((attr) => {
      const link = linkTemplate
        .replace(/{{id}}/g, attr.id)
        .replace(/{{name}}/g, attr.name);
      linkContainer.insertAdjacentHTML('beforeend', link);
    });
  },

  displayDetailAttraction: (id) => {
    const detailContainer = document.querySelector('div#informasi');
    const detailTemplate = document.querySelector('script[data-template="detailInformation"]').innerHTML;
    const attr = controller.getDetailAttraction(id);

    view.closeDetailAttraction();

    const detailAttraction = detailTemplate
      .replace(/{{id}}/g, attr.id)
      .replace(/{{name}}/g, attr.name)
      .replace(/{{desc}}/g, attr.desc)
      .replace(/{{address}}/g, attr.address)
      .replace(/{{url}}/g, attr.url);

    setTimeout(() => {
      detailContainer.innerHTML = '';
      detailContainer.style.width = '250px';
      detailContainer.insertAdjacentHTML('beforeend', detailAttraction);
    }, 500);
  },

  closeDetailAttraction: () => {
    const detailContainer = document.querySelector('div#informasi');
    detailContainer.innerHTML = '';
    detailContainer.style.width = 0;
  },

  render: () => {
    view.displayAttractions();
  },
};

/* Google Maps callback */
function initMap() {
  data.mapCenterGlobal = new google.maps.LatLng(LAT_LNG[0], LAT_LNG[1]);

  data.markerIcon = {
    url: 'image/svg/location.svg',
    scaledSize: new google.maps.Size(50, 50),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(26, 50),
  };
  data.markerIconBigger = {
    url: 'image/svg/location.svg',
    scaledSize: new google.maps.Size(120, 120),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(60, 120),
  };

  data.mapGlobal = controller.createMap();

  setTimeout(() => {
    data.markersGlobal = controller.createMarker();
  }, 1000);

  setTimeout(() => {
    controller.setListenerToMarkers();
  }, 1000);
}

controller.init();

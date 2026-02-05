# Debugging FrontEnd

## Prebuilding : States

* __isChatOpen__ : Controla si el panel del asistente virtual aparece o no. Su estado original es __false__

* __activeSlide__ : Monitorea la posición de las slides en el carrousel. Comienza en 0

* __slides__ : un array que contiene las imágenes del carrousel. Se usa useMemo para no crearlo en cada re render

## Prebuilding : useEffect

- __useEffect__ : Se crea un useEffect al inicio que crea un __Interval__ cada 5200 ms que va cambiando el state de __activeSlide__. La operación __%__ entrega el resto de la operación. Tenemos 4 slides, por lo tanto:  
    - prev 0 -> (0+1) % 4 = 1
    - prev 1 -> (1+1) % 4 = 1
    - prev 2 -> (2+1) % 4 = 1
    - prev 3 -> (3+1) % 4 = 0 (último se reinicia a 0)

## MainSite : Carousel

### hero-media (contenedor padre)

Este contenedor tiene una propiedad importante que es 

```css
position : relative
```

Si bien, no lo afecta directamente, afecta a los hijos que lo usan como referente cuando usamos 

```css
position : absolute
```

### carousel (contenedor único carrusel)

Cada imagen se mapea y por defecto tiene la clase __carousel-slide__ . 

```css
.carousel-slide {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(1.02);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
```
Ahora bien, la slide __activa__ tiene una propiedad diferente:

```css
.carousel-slide.active {
  opacity: 1;
  transform: scale(1);
}
```

De esta forma :

* Todas parten con opacity: 0 y scale(1.02) (ligeramente más grandes).

* La activa se ve con opacity: 1 y scale(1).

Cuando cambia el estado:

* La que estaba activa pasa a opacity: 0 y vuelve a scale(1.02) (se apaga y se agranda un poco).

* La nueva activa hace lo contrario: sube a opacity: 1 y baja a scale(1).

__OBS : La transición siempre va en el estado base (el selector normal), no en el hover/active.__  

### hero-dots (contenedor)

```css
.hero-dots {
  position: absolute;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  align-items: center;
  background: rgba(255, 255, 255, 0.85);
  padding: 6px 12px;
  border-radius: 999px;
}
```

De aquí importante mencionar :

* __left__ : Para centrar el contenedor en el medio (borde izquierdo)

* __transform__ : una vez aplicado left, mueve el 50% del contenedor a la izquierda, así queda full centrado

* __bottom__ : 28px sobre el borde inferior

* __position : absolute__ : Toma como referencia el padre hero-media

### __hero-dots button__
Efecto similar a lo anterior del carrusel, solo que aquí solo cambia el fondo y el tamaño del botón. El active lo otorga el state

```css
.hero-dots button {
  background: #d8d0ca;
  transition: transform 0.2s ease, background 0.2s ease;
}

.hero-dots button.active {
  background: var(--brand);
  transform: scale(1.2);
}
```

### __Positions__

* __static__ : flujo normal. No responde a top/right/bottom/left
* __relative__ : tiene su propio lugar y se puede mover con top/left. Sirve como padre para los hijos que usan absolute
* __absolute__ : se posicionan con respecto al primer ancestro (distinto de static) que encuentran
* __fixed__ : se posicionan con respecto al viewport. Por eso el botón que abre el asistente se mantiene siempre pegado







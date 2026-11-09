---
author: x0k
category: forensics
event: PicoCTF
description: Análisis forense multicapa de archivo codificado en Base64 que revela una imagen PNG con datos hexadecimales ocultos y recuperación de flag.
difficulty: easy
heroImage: /images/base64-png-forensics.avif
pubDate: 2026-02-22
tags:
- forensics
- picoctf
- base64
- hex
- png
title: Análisis Forense Multicapa - Writeup del Reto PicoCTF [Flag in Flame]
---

## Introducción

En este reto se proporcionó un archivo de texto de aproximadamente 1.5 MB que contenía una larga cadena codificada.

El objetivo era identificar el contenido real del archivo y determinar si ocultaba información adicional en múltiples capas.

Este tipo de escenarios simula técnicas utilizadas para encapsular datos dentro de distintos formatos con el fin de dificultar su análisis superficial.

En contextos reales, la ocultación por capas puede emplearse para evasión básica de controles automatizados o inspecciones manuales poco profundas.

------------------------------------------------------------------------

## Metodología de Análisis

El análisis se realizó siguiendo un enfoque por capas, validando cada transformación antes de continuar con la siguiente etapa.

------------------------------------------------------------------------

## Fase 0: Identificación del Tipo de Archivo

El primer paso consistió en determinar el tipo real de datos contenidos en el archivo, independientemente de su extensión `.txt`.

### Análisis inicial con `file`

``` bash
file logs.txt
```

Resultado:

``` bash
logs.txt: ASCII text, with very long lines (65536), with no line terminators
```

> **Nota:** `file` identifica el tipo de archivo basándose en firmas conocidas (magic numbers) y heurísticas simples. En este caso, el resultado _ASCII text_ indica únicamente que el archivo contiene caracteres imprimibles, pero **no revela si dichos datos representan texto real o información codificada**.

Dado el tamaño del archivo y la ausencia de contenido legible a simple vista, se planteó la hipótesis de que el archivo pudiera estar codificado.

### Análisis estadístico con `ent`

Para validar esta hipótesis se utilizó la herramienta `ent`.

```bash
ent logs.txt
```

> **Nota:** `ent` realiza un análisis estadístico del contenido de un archivo,  calculando métricas como entropía, compresibilidad y correlación entre bytes. Es especialmente útil para distinguir entre texto natural, datos codificados y datos cifrados.

Resultados relevantes:

- Entropía cercana a **6 bits por byte**
    
- Compresibilidad aproximada del **25 %**
    
- Baja correlación serial
    
- Distribución no lingüística
    

Estos valores son característicos de datos **codificados en Base64**, los cuales presentan una entropía mayor que el texto plano pero menor  que los datos cifrados o comprimidos.

Con esta evidencia se confirmó que el archivo no contenía texto humano, sino datos codificados, siendo Base64 el candidato más probable.

---

## Fase 1: Decodificación Base64

El archivo original contenía datos codificados en Base64.

> **Nota:** `base64` es una utilidad de línea de comandos que permite codificar o decodificar datos utilizando el esquema Base64.
Base64 convierte datos binarios en texto ASCII y no constituye un mecanismo de cifrado.

### Acción

``` bash
base64 -d logs.txt > decoded.txt
```

### Identificación del archivo decodificado

Una vez obtenida la salida, se utilizó nuevamente `file` para identificar  el tipo real de datos generados.

```bash
file decoded.txt
```

Resultado:

```bash
decoded.txt: PNG image data, 896 x 1152, 8-bit/color RGB, non-interlaced
```

Este resultado confirmó que, aunque el archivo carecía de extensión adecuada, el contenido correspondía a una imagen PNG válida.

### Renombrado del archivo

Dado que la extensión no coincidía con el tipo real de datos, se procedió a renombrar el archivo para reflejar correctamente su formato.

```bash
mv decoded.txt imagen_recuperada.png
```

Este paso facilita el análisis posterior y evita interpretaciones erróneas por parte de herramientas que dependen de la extensión del archivo.

---
## Fase 1.2: Inspección Visual de la Imagen PNG

Una vez identificado y renombrado correctamente el archivo como una imagen PNG válida, se procedió a realizar una inspección visual directa del contenido.

### Apertura de la imagen

La imagen fue abierta utilizando un visor gráfico estándar para evaluar si contenía información relevante a simple vista.

```bash
xdg-open imagen_recuperada.png
```

### Observación

A nivel visual, la imagen no presentaba información evidente como texto  legible, marcas visibles o elementos gráficos que revelaran  directamente la flag.

No obstante, durante esta inspección se identificó la presencia de una **cadena alfanumérica inusual** integrada dentro de la imagen, la cual  no parecía formar parte natural del contenido visual.

Esta anomalía sugirió que la imagen estaba siendo utilizada como un **contenedor de datos**, ocultando información adicional que no era  accesible únicamente mediante observación superficial.

### Conclusión de la fase

La detección de esta cadena atípica reforzó la hipótesis de que el archivo PNG contenía datos incrustados u ofuscados, justificando la necesidad de un análisis interno del archivo binario en fases posteriores.

---
## Fase 2: Extracción de Texto mediante OCR (Tesseract)

Dado que la imagen PNG no mostraba información claramente legible a simple vista, se procedió a aplicar reconocimiento óptico de caracteres (OCR) para identificar posible texto incrustado dentro del contenido visual.

### Uso de `tesseract`

> **Nota:** `tesseract` es una herramienta de OCR que permite extraer texto contenido en imágenes, incluso cuando este no resulta evidente para el observador humano. Es especialmente útil cuando la información está integrada de forma sutil dentro de una imagen o presenta bajo contraste.

### Acción

Se ejecutó `tesseract` indicando explícitamente un archivo de salida (base), lo que genera un archivo de texto con extensión `.txt`.

```bash
tesseract imagen_recuperada.png decoded_img
```

Durante la ejecución, la herramienta estimó automáticamente la resolución de la imagen:

```text
Estimating resolution as 206
```

### Recuperación del texto extraído

Tras la ejecución, el resultado del OCR se almacenó en el archivo `decoded_img.txt`.

```bash
cat decoded_img.txt
```

### Hallazgo

El contenido extraído incluía múltiples fragmentos irrelevantes, producto del reconocimiento de ruido visual. Sin embargo, entre dichos  fragmentos se identificó una **cadena larga compuesta exclusivamente por caracteres hexadecimales**:

```text
7069636F4354467B666F72656E736963735F616E616C797369735F69735F616D617A696E675F32353631613139347D
```

Esta cadena presentaba un patrón consistente de codificación Base16 (hexadecimal), indicando la presencia de una nueva capa de ofuscación  dentro del archivo PNG.



------------------------------------------------------------------------

## Fase 3: Identificación de Codificación Hexadecimal

La cadena detectada presentaba las siguientes características:

-   Uso exclusivo de caracteres 0--9 y A--F
-   Longitud considerable
-   Patrón consistente en pares de caracteres

Esto sugiere codificación Base16 (Hexadecimal), donde cada par representa un byte ASCII.

------------------------------------------------------------------------

## Fase 4: Decodificación Final

Para convertir el contenido hexadecimal a texto plano se utilizó la herramienta `xxd`.

> **Nota:** `xxd -r -p` permite revertir un volcado hexadecimal plano a su representación binaria original.

### Acción

``` bash
echo "7069636F4354467B666F72656E736963735F616E616C797369735F69735F616D617A696E675F32353631613139347D" | xxd -r -p
```

Resultado:

```text
picoCTF{forensics_analysis_is_amazing_2561a194}
```

------------------------------------------------------------------------

## Flujo de Capas Detectado

1.  Capa 1: Base64 (Transporte de datos)
2.  Capa 2: Archivo PNG (Contenedor)
3.  Capa 3: Cadena Hexadecimal (Ofuscación)
4.  Capa 4: Texto plano (Flag)

------------------------------------------------------------------------

## Implicaciones para Seguridad

En un entorno real, este tipo de técnica puede utilizarse para:

-   Ocultar datos en archivos aparentemente legítimos.
-   Transferir información encubierta.
-   Evasión básica de sistemas de inspección superficial.
-   Encapsular fragmentos de código o payloads.

Desde una perspectiva defensiva es recomendable:

-   Validar tipos reales de archivo.
-   Analizar contenido binario cuando existan sospechas.
-   Automatizar detección de patrones Base64 y Hex.
-   No confiar únicamente en la extensión del archivo.

------------------------------------------------------------------------

## Conclusión

Este análisis demuestra la importancia de abordar archivos sospechosos desde un enfoque estructurado y por capas.

Un proceso forense efectivo requiere:

-   Identificar el formato externo.
-   Validar cada transformación.
-   Detectar patrones de codificación comunes.
-   Confirmar hipótesis mediante pruebas técnicas.

En ciberseguridad defensiva, los datos rara vez se presentan en una sola capa.

------------------------------------------------------------------------

## Referencias

- [PicoCTF](https://picoctf.org)

- [Reto Flag in Flame](https://play.picoctf.org/practice/challenge/523)  

- [Base 64 - Wikipedia](https://en.wikipedia.org/wiki/Base64)
  
- [Base 16 Hexadecimal - Wikipedia](https://en.wikipedia.org/wiki/Hexadecimal#Base16)
---
author: yusnelgg
category: forensics
description: Análisis forense de imagen de disco ext4 con recuperación
  de archivos borrados y reconstrucción manual de sectores para obtener
  la flag del reto Dear Diary.
difficulty: medium
heroImage: /images/dear-diary-disk-forensics.avif
pubDate: 2026-02-23
tags:
- forensics
- picoctf
- dfir
- autopsy
- ext4
- disk
- unallocated
title: Análisis Forense de Disco - Writeup del Reto PicoCTF [Dear
  Diary]
---

## Introducción

En este reto de picoCTF se proporcionó una imagen de disco de
aproximadamente 1 GB (`disk.flag.img`).

El objetivo era recuperar una flag fragmentada que no se encontraba en
un archivo visible del sistema.

Este escenario simula una situación real de análisis forense
post-incidente, donde el investigador debe recuperar información
eliminada deliberadamente y reconstruirla a partir de estructuras
físicas del almacenamiento.

------------------------------------------------------------------------

## Metodología de Análisis

1.  Identificación de la estructura de particiones.
2.  Selección de la partición relevante.
3.  Análisis de archivos borrados y espacio no asignado.
4.  Reconstrucción manual de datos a nivel de unidad de asignación.

Herramienta principal utilizada: Autopsy Digital Forensics Platform.

------------------------------------------------------------------------

## Fase 0: Identificación de la Estructura del Disco

El primer paso consistió en identificar la estructura de particiones contenida en la imagen `disk.flag.img`.

Para ello se utilizó la herramienta `fdisk`, que permite listar la tabla de particiones de un disco o imagen.

### Enumeración de particiones con `fdisk -l`

```bash
fdisk -l disk.flag.img
```

Resultado:

```bash
Disk disk.flag.img: 1 GiB, 1073741824 bytes, 2097152 sectors  
Units: sectors of 1 * 512 = 512 bytes  
Sector size (logical/physical): 512 bytes / 512 bytes  
Disklabel type: dos  
Disk identifier: 0x6062d30a  
  
Device         Boot   Start     End Sectors  Size Id Type  
disk.flag.img1 *       2048  616447  614400  300M 83 Linux  
disk.flag.img2       616448 1140735  524288  256M 82 Linux swap / Solaris  
disk.flag.img3      1140736 2097151  956416  467M 83 Linux
```

### Análisis de resultados

Del resultado anterior se puede determinar que:

- El esquema de particiones es **MBR (DOS)**.
    
- El disco contiene **tres particiones principales**.
    
- La tercera partición (`disk.flag.img3`) es de tipo **83 (Linux)**.
    
- La segunda partición corresponde a **swap**.
    
- La primera partición es arrancable (flag `*` en Boot).
    

La partición relevante para el análisis fue:

```bash
disk.flag.img3
```

Esta partición, tras ser examinada en herramientas forenses, contenía un sistema de archivos:

```text
Linux ext4
```

> **Nota forense:** Identificar correctamente la partición objetivo es fundamental. Analizar la partición equivocada puede generar falsos negativos o pérdida de tiempo durante la investigación.

------------------------------------------------------------------------

## Fase 1: Análisis con Autopsy

Se cargó la imagen y se analizó la tercera partición enfocándose en:

-   Archivos borrados
-   Metadatos residuales
-   Espacio no asignado (Unallocated Space)

------------------------------------------------------------------------

## Fase 2: Identificación de Archivos Huérfanos

Se detectaron múltiples archivos llamados:

    -file.txt

Estos archivos estaban eliminados lógicamente, pero sus datos físicos
aún persistían en los bloques del disco.

![Estructura de particiones identificada con fdisk](/public/images/dear-diary/autopsy.avif)

------------------------------------------------------------------------

## Fase 3: Análisis de Unidades de Asignación

Bloques clave identificados:

-   Unit 1423344 → Encabezado de la flag
-   Units 1423356 -- 1423410 → Caracteres correlativos

La flag estaba fragmentada en múltiples bloques contiguos.

------------------------------------------------------------------------

## Fase 4: Reconstrucción Manual

Proceso:

1.  Navegar a cada unidad identificada.
2.  Interpretar valores hexadecimales.
3.  Convertir a ASCII.
4.  Concatenar carácter por carácter.
5.  Validar estructura `picoCTF{...}`.

------------------------------------------------------------------------

## Falsos Positivos

Archivo detectado:

    01257414.exe

Se determinó que era un falso positivo por coincidencia de firmas (magic
bytes) en espacio no asignado.

------------------------------------------------------------------------

## Conclusión

Flag recuperada exitosamente mediante reconstrucción manual de sectores
pertenecientes a archivos eliminados.

Flag Final:

    picoCTF{1_533_n4m35_80d24b30}

Principio clave: cuando las estructuras lógicas fallan, la evidencia
permanece en la capa física del almacenamiento.

---
## Referencias


- [PicoCTF](https://picoctf.org)

- [Reto Dear Diary](https://play.picoctf.org/practice/challenge/413)
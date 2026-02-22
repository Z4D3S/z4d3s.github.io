---
title: Guía de Detección de SQL Injection en Logs
description: Aprende a identificar intentos de SQL injection en los logs de tu aplicación web. Estrategias de detección defensiva para Blue Team.
pubDate: 2026-01-15
heroImage: /images/sqli-detection.avif
tags:
  - sqli
  - detection
  - log-analysis
  - waf
  - defense
category: log-analysis
author: NightOps Team
difficulty: info
---

## Introducción

SQL Injection es una de las vulnerabilidades más críticas en aplicaciones web. En esta guía, aprenderemos **cómo detectar** intentos de SQLi en logs para poder responder rápidamente.

## ¿Por qué detección?

El enfoque Blue Team se centra en detectar amenazas antes de que causen daño. Conocer cómo funcionan los ataques nos permite:

1. Identificar actividad maliciosa en etapas tempranas
2. Crear reglas de detección efectivas
3. Mejorar nuestra postura de seguridad

## Patrones de SQLi en Logs

### 1. Errores de Sintaxis SQL

Los atacantes frecuentemente causan errores que quedan registrados:

```log
192.168.1.100 - - [15/Jan/2024:10:30:22 +0000] "GET /products?id=1' HTTP/1.1" 500
```

Busca patrones como:
- Comillas simples `'`
- Comillas doble `"`
- Comentarios SQL `--`, `/*`

### 2. UNION Based Injection

```log
/products?id=1 UNION SELECT username,password FROM users--
```

### 3. Boolean Based Blind

```log
/products?id=1' AND 1=1--
/products?id=1' AND 1=2--
```

## Reglas de Detección congrep

```bash
# Detectar comillas simples en parámetros
grep -E "(\'|%27)" access.log | grep -E "(id=|user=|pass=)"

# Detectar comentarios SQL
grep -E "(--|%2D%2D|\/\*)" access.log

# Detectar UNION SELECT
grep -iE "(UNION.*SELECT|union.*select)" access.log
```

## Configuración de WAF

Un WAF (Web Application Firewall) puede bloquear estos ataques automáticamente:

```apache
# Example WAF rule
SecRule ARGS:id "@rx ('|(\%27))|(\")|(\%22)|(;)|(\%3B))" \
    "id:1001,\
    phase:1,\
    deny,\
    status:403,\
    msg:'SQL Injection Attempt Detected'"
```

## Indicators of Compromise (IOC)

Busca estos indicadores en tus logs:

| Indicador | Descripción |
|-----------|-------------|
| Errores 500 inusuales | Posible explotación fallida |
| Volumen alto de requests | Scanning automatizado |
| Patrones anómalos | Tiempo de respuesta lento |

## Respuesta a Incidentes

Si detectas un intento de SQLi:

1. **Registrar** la IP de origen
2. **Bloquear** la IP en el firewall
3. **Analizar** el alcance del ataque
4. **Revisar** integridad de la base de datos
5. **Documentar** el incidente

## Conclusión

La detección temprana de SQL Injection es crucial para la defensa. Implementa logging detallado, configura alertas y mantén actualizado tu WAF.

> "La mejor defensa es un buen offense... de detección." - Blue Team Proverb

## Referencias

- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [ModSecurity WAF](https://modsecurity.org/)
- [SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)

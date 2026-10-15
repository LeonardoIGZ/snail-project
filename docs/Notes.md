Desiciones tomadas por fases

# Fase 0

1. Para la configuración de `ts.config.json` se usa `module: "Preserve"` = `Bundler` para permitir exports sin `.js`. El API se ejecutará con `tsx` en desarrollo y se empaquetara con un bundler para producción.

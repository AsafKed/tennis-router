#!/bin/bash
git ls-files --exclude-standard -- ':!:**/*.[pjs][npv]g' ':!:**/*.ai' ':!:.idea' ':!:**/*.eslintrc' ':!:package-lock.json' ':!:**/*.csv' ':!:**/package-lock.json' ':!:**/*.json' ':!:*.json' ':!:**/**/*..json' ':!:.gitignore' | xargs wc -l

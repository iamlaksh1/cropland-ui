#!/bin/bash
set -euxo pipefail

./scripts/lint.sh
poetry run pytest -s --cov=cropland_api/ --cov=tests --cov-report=term-missing ${@-} --cov-report html

#!/bin/bash
set -euxo pipefail

poetry run cruft check
poetry run mypy --ignore-missing-imports cropland_api/
poetry run isort --check --diff cropland_api/ tests/
poetry run black --check cropland_api/ tests/
poetry run flake8 cropland_api/ tests/
poetry run safety check -i 39462 -i 40291
poetry run bandit -r cropland_api/

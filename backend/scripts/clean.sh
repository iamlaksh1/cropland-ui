#!/bin/bash
set -euxo pipefail

poetry run isort cropland_api/ tests/
poetry run black cropland_api/ tests/

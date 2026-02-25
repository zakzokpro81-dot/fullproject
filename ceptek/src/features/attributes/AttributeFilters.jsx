import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export function AttributeFilters({ filters, setFilters }) {
  const { t } = useTranslation(["attributesFeature", "common"]);
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({
      data_type: "",
      has_options: "",
      is_active: "",
    });
  };

  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>{t("attributesFeature:dataType")}</InputLabel>
        <Select
          value={filters.data_type}
          label={t("attributesFeature:dataType")}
          name="data_type"
          onChange={handleFilterChange}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="text">Text</MenuItem>
          <MenuItem value="number">Number</MenuItem>
          <MenuItem value="boolean">Boolean</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>{t("attributesFeature:hasOptions")}</InputLabel>
        <Select
          value={filters.has_options}
          label={t("attributesFeature:hasOptions")}
          name="has_options"
          onChange={handleFilterChange}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value={true}>Yes</MenuItem>
          <MenuItem value={false}>No</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>{t("common:active")}</InputLabel>
        <Select
          value={filters.is_active}
          label={t("common:active")}
          name="is_active"
          onChange={handleFilterChange}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value={true}>{t("common:active")}</MenuItem>
          <MenuItem value={false}>{t("common:inactive")}</MenuItem>
        </Select>
      </FormControl>

      {hasFilters && (
        <Button color="inherit" onClick={handleReset}>
          Reset
        </Button>
      )}
    </Stack>
  );
}

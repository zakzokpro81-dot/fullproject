import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Button,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../categories/category.api";
import {
  getTrackingTypes,
  getVariantStrategiesFromDB,
} from "./productType.api";

export function ProductTypeFilters({ filters, setFilters }) {
  const { data: categoriesResult } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 10,
  });
  const categories = categoriesResult?.data ?? [];

  const { data: trackingTypes = [] } = useQuery({
    queryKey: ["trackingTypes"],
    queryFn: getTrackingTypes,
    staleTime: 1000 * 60 * 10,
  });

  const { data: variantStrategies = [] } = useQuery({
    queryKey: ["variantStrategies"],
    queryFn: getVariantStrategiesFromDB,
    staleTime: 1000 * 60 * 10,
  });

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({
      tracking_type_id: "",
      variant_strategy_id: "",
      category_id: "",
    });
  };

  const hasFilters = Object.values(filters).some((v) => v);

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={filters.category_id}
          label="Category"
          name="category_id"
          onChange={handleFilterChange}
        >
          <MenuItem value="">All</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Tracking Type</InputLabel>
        <Select
          value={filters.tracking_type_id}
          label="Tracking Type"
          name="tracking_type_id"
          onChange={handleFilterChange}
        >
          <MenuItem value="">All</MenuItem>
          {trackingTypes.map((type) => (
            <MenuItem key={type.id} value={type.id}>
              {type.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Product Structure</InputLabel>
        <Select
          value={filters.variant_strategy_id}
          label="Product Structure"
          name="variant_strategy_id"
          onChange={handleFilterChange}
        >
          <MenuItem value="">All</MenuItem>
          {variantStrategies.map((vs) => (
            <MenuItem key={vs.id} value={vs.id}>
              {vs.name}
            </MenuItem>
          ))}
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

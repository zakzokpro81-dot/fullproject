import React, { useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createAttributeOption,
  updateAttributeOption,
} from "./attributeOption.api";

import { attributeOptionSchema } from "./attributeOption.schema";

export default function AttributeOptionForm({
  defaultValues,
  attributes = [],
  onClose,
}) {
  const queryClient = useQueryClient();

  const selectedAttribute = useMemo(() => {
    return attributes.find(a => a.id === defaultValues?.attribute_id);
  }, [attributes, defaultValues]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(attributeOptionSchema),
    defaultValues: {
      attribute_id: "",
      value: "",
      slug: "",
    },
  });

  const watchedAttributeId = watch("attribute_id");
  const activeAttribute = attributes.find(a => a.id === watchedAttributeId);

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    } else {
      reset({
        attribute_id: "",
        value: "",
        slug: "",
      });
    }
  }, [defaultValues, reset]);

  const createMutation = useMutation({
    mutationFn: createAttributeOption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attribute-options"] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAttributeOption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attribute-options"] });
      onClose();
    },
  });

  const onSubmit = (data) => {
    defaultValues?.id
      ? updateMutation.mutate({ id: defaultValues.id, ...data })
      : createMutation.mutate(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>

        {/* Attribute */}
        <Controller
          name="attribute_id"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label="Attribute"
              {...field}
              fullWidth
              error={!!errors.attribute_id}
              helperText={errors.attribute_id?.message}
            >
              {attributes.map(attr => (
                <MenuItem key={attr.id} value={attr.id}>
                  {attr.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        {/* Value – dynamic by data_type */}
        {activeAttribute?.data_type === "boolean" ? (
          <Controller
            name="value"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value === "true"} />}
                label="Value"
              />
            )}
          />
        ) : (
          <Controller
            name="value"
            control={control}
            render={({ field }) => (
              <TextField
                label="Value"
                type={activeAttribute?.data_type === "number" ? "number" : "text"}
                {...field}
                fullWidth
                error={!!errors.value}
                helperText={errors.value?.message}
              />
            )}
          />
        )}

        {/* Slug */}
        <Controller
          name="slug"
          control={control}
          render={({ field }) => (
            <TextField
              label="Slug"
              {...field}
              fullWidth
              error={!!errors.slug}
              helperText={errors.slug?.message}
            />
          )}
        />

        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {defaultValues ? "Update" : "Save"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

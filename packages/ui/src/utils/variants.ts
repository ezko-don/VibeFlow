type VariantConfig<T extends Record<string, any>> = {
  [K in keyof T]: Record<string, string>
}

export function createVariants<T extends Record<string, any>>(
  config: VariantConfig<T>
): (props: Partial<T>) => string {
  return (props: Partial<T>) => {
    const classes: string[] = []
    
    for (const [key, value] of Object.entries(props)) {
      if (value && config[key] && config[key][value as string]) {
        classes.push(config[key][value as string])
      }
    }
    
    return classes.join(' ')
  }
}

export function validateProjectName(name: string): boolean | string {
  if (!name) {
    return 'Project name is required';
  }

  if (!/^[a-z0-9-_]+$/i.test(name)) {
    return 'Project name can only contain letters, numbers, hyphens, and underscores';
  }

  if (name.length < 3) {
    return 'Project name must be at least 3 characters long';
  }

  if (name.length > 50) {
    return 'Project name must be less than 50 characters';
  }

  const forbiddenNames = [
    'node_modules',
    'src',
    'dist',
    'build',
    'test',
    'tests',
    '.git',
    'package.json'
  ];

  if (forbiddenNames.includes(name.toLowerCase())) {
    return `"${name}" is a reserved name`;
  }

  return true;
}

export function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[_\s]+/g, '-');
}

export function getCurrentDateTime(): string {
  return new Date().toISOString();
}

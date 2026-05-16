// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { InputAutoComplete } from '../input-auto-complete';

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' }
];

describe('InputAutoComplete', () => {
  it('should render with label', () => {
    render(
      <InputAutoComplete options={options} onSelect={vi.fn()} label="Fruit" />
    );

    expect(screen.getByText('Fruit')).toBeInTheDocument();
  });

  it('should show options on focus', () => {
    render(<InputAutoComplete options={options} onSelect={vi.fn()} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });

  it('should filter options by input', async () => {
    const user = userEvent.setup();

    render(<InputAutoComplete options={options} onSelect={vi.fn()} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    await user.type(input, 'ban');

    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.queryByText('Cherry')).not.toBeInTheDocument();
  });

  it('should call onSelect when an option is selected in single mode', () => {
    const onSelect = vi.fn();

    render(<InputAutoComplete options={options} onSelect={onSelect} />);

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    const option = screen.getByText('Banana');
    fireEvent.click(option);

    expect(onSelect).toHaveBeenCalledWith('banana');
  });

  it('should render badges for selected values in multi mode', () => {
    render(
      <InputAutoComplete
        options={options}
        onSelect={vi.fn()}
        multiple
        selectedValues={['apple', 'cherry']}
      />
    );

    const badges = screen.getAllByText(
      (_, element) => element?.getAttribute('data-slot') === 'badge'
    );

    expect(badges).toHaveLength(2);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });

  it('should call onRemove when clicking remove button on a badge', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(
      <InputAutoComplete
        options={options}
        onSelect={vi.fn()}
        multiple
        selectedValues={['apple']}
        onRemove={onRemove}
      />
    );

    const badge = screen.getByText('Apple').closest('[data-slot="badge"]');
    const removeButton = badge!.querySelector('button')!;
    await user.click(removeButton);

    expect(onRemove).toHaveBeenCalledWith('apple');
  });

  it('should show Create option when no match and onCreate is provided', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();

    render(
      <InputAutoComplete
        options={options}
        onSelect={vi.fn()}
        onCreate={onCreate}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    await user.type(input, 'Mango');

    const createOption = screen.getByRole('option');
    expect(createOption).toHaveAttribute('data-value', '__create__Mango');
    expect(createOption.textContent).toContain('Create');
    expect(createOption.textContent).toContain('Mango');
  });

  it('should show skeleton when loading is true', () => {
    render(
      <InputAutoComplete
        options={options}
        onSelect={vi.fn()}
        loading
        label="Fruit"
      />
    );

    expect(screen.queryByText('Fruit')).not.toBeInTheDocument();

    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(2);
  });

  it('should show error message when error is provided', () => {
    render(
      <InputAutoComplete
        options={options}
        onSelect={vi.fn()}
        error="This field is required"
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });
});

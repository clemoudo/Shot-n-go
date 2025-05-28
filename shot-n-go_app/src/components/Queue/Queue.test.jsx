import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Queue from './Queue';

// Simulation des classes du module CSS
jest.mock('./Queue.module.css', () => ({
  queue_container: 'queue_container',
  machine_select: 'machine_select',
  queue_list: 'queue_list',
  queue_item: 'queue_item',
  active: 'active',
  empty_message: 'empty_message',
}));

describe('Composant File d\'attente', () => {
  let fetchQueueMock;
  let fetchMachinesMock;
  const machinesInit = [
    { id: 'm1', name: 'Machine 1' },
    { id: 'm2', name: 'Machine 2' },
  ];
  const queueItems = [
    { id: 'q1', commande_id: 101, user_name: 'Alice' },
    { id: 'q2', commande_id: 102, user_name: 'Bob' },
  ];

  beforeEach(() => {
    fetchQueueMock = jest.fn();
    fetchMachinesMock = jest.fn();
  });

  test('affiche le titre principal', () => {
    render(
      <Queue
        machineState={{ machines: machinesInit, fetchMachines: fetchMachinesMock }}
        queueState={{ queue: [], fetchQueue: fetchQueueMock }}
      />
    );
    const titre = screen.getByRole('heading', { level: 1 });
    expect(titre).toHaveTextContent("File d'attente");
  });

  test('appelle fetchMachines au montage et fetchQueue avec le premier id de machine', async () => {
    render(
      <Queue
        machineState={{ machines: machinesInit, fetchMachines: fetchMachinesMock }}
        queueState={{ queue: [], fetchQueue: fetchQueueMock }}
      />
    );
    expect(fetchMachinesMock).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(fetchQueueMock).toHaveBeenCalledWith('m1');
    });
  });

  test('affiche correctement les options de machine selon la prop machines', () => {
    render(
      <Queue
        machineState={{ machines: machinesInit, fetchMachines: fetchMachinesMock }}
        queueState={{ queue: [], fetchQueue: fetchQueueMock }}
      />
    );
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(machinesInit.length);
    expect(options[0]).toHaveTextContent('Machine 1');
  });

  test('wrapper de la liste a toujours la bonne classe', () => {
    render(
      <Queue
        machineState={{ machines: machinesInit, fetchMachines: fetchMachinesMock }}
        queueState={{ queue: [], fetchQueue: fetchQueueMock }}
      />
    );
    const wrapper = screen.getByText(/La file d'attente est vide/i).parentElement;
    expect(wrapper).toHaveClass('queue_list');
  });

  test('appelle fetchQueue lors de la sélection d\'une autre machine', async () => {
    render(
      <Queue
        machineState={{ machines: machinesInit, fetchMachines: fetchMachinesMock }}
        queueState={{ queue: [], fetchQueue: fetchQueueMock }}
      />
    );
    await waitFor(() => expect(fetchQueueMock).toHaveBeenCalledWith('m1'));
    fetchQueueMock.mockClear();
    fireEvent.change(screen.getByLabelText(/Choisissez une machine/i), {
      target: { value: 'm2' },
    });
    await waitFor(() => expect(fetchQueueMock).toHaveBeenCalledWith('m2'));
  });

  test('chaque élément de queue a la classe queue_item et le premier reçoit active', () => {
    render(
      <Queue
        machineState={{ machines: machinesInit, fetchMachines: fetchMachinesMock }}
        queueState={{ queue: queueItems, fetchQueue: fetchQueueMock }}
      />
    );
    const items = screen.getAllByText(/#\d+ -/i);
    items.forEach(item => {
      expect(item).toHaveClass('queue_item');
    });
    expect(items[0]).toHaveClass('active');
  });

  test('met à jour le rendu quand queueState.queue change', () => {
    const { rerender } = render(
      <Queue
        machineState={{ machines: machinesInit, fetchMachines: fetchMachinesMock }}
        queueState={{ queue: [], fetchQueue: fetchQueueMock }}
      />
    );
    expect(screen.queryByText('#101 - Alice')).toBeNull();
    rerender(
      <Queue
        machineState={{ machines: machinesInit, fetchMachines: fetchMachinesMock }}
        queueState={{ queue: queueItems, fetchQueue: fetchQueueMock }}
      />
    );
    expect(screen.getByText('#101 - Alice')).toBeInTheDocument();
  });

  test('tolère des machines sans id ou sans name', () => {
    const mauvaisMachines = [
      { id: '', name: '' },
      { name: 'Machine Inconnue' },
      { id: 'm3' },
    ];
    render(
      <Queue
        machineState={{ machines: mauvaisMachines, fetchMachines: fetchMachinesMock }}
        queueState={{ queue: [], fetchQueue: fetchQueueMock }}
      />
    );
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(mauvaisMachines.length);
  });

  test('applique la classe CSS queue_container au conteneur principal', () => {
    render(
      <Queue
        machineState={{ machines: machinesInit, fetchMachines: fetchMachinesMock }}
        queueState={{ queue: [], fetchQueue: fetchQueueMock }}
      />
    );
    const container = screen.getByRole('heading', { level: 1 }).closest('div');
    expect(container).toHaveClass('queue_container');
  });

  test('applique la classe CSS machine_select au select', () => {
    render(
      <Queue
        machineState={{ machines: machinesInit, fetchMachines: fetchMachinesMock }}
        queueState={{ queue: [], fetchQueue: fetchQueueMock }}
      />
    );
    const select = screen.getByLabelText(/Choisissez une machine/i);
    expect(select).toHaveClass('machine_select');
  });
});
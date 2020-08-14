interface DeviceLayout {
  devices: number;
  columns: number;
  devices_per_column: number;
}

export function LayoutFinder(numDevices: number): DeviceLayout {
  const devices_per_column = Math.ceil(Math.sqrt(numDevices));
  const columns = Math.ceil(numDevices / devices_per_column);

  return {
    // object instead of an array so theres not confusion on the order of output
    devices: numDevices,
    columns: columns,
    devices_per_column: devices_per_column,
  };
}

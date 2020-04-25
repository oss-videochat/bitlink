interface DeviceLayout {
    devices: number,
    columns: number,
    devices_per_column: number

}

export function LayoutFinder(numDevices: number): DeviceLayout {
    /*

    If anyone wants to find a O(1) function for this be my guest. I couldn't. This is O(n) because it must loop through
    all the previous values.

    Some information:

    - devices_per_column = ciel(devices/columns)

     */
    let columns = 1; // some constants, with one video we of course want one column of one device
    let devices_per_column = 1;

    for (let i = 2; i <= numDevices; i++) { // start with 2, we already did 1 as a constant
        if (numDevices > columns * devices_per_column) { // if the current layout works then we don't need to do anything
            if (columns === devices_per_column) { // this is just based on a pattern i found, not really sure why it works
                devices_per_column++;
            } else {
                columns++;
            }
        }
    }

    return { // object instead of an array so theres not confusion on the order of output
        devices: numDevices,
        columns: columns,
        devices_per_column: devices_per_column
    }
}

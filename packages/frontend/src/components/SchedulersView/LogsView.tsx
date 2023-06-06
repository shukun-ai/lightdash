import { SchedulerWithLogs } from '@lightdash/common';
import {
    ActionIcon,
    Anchor,
    Center,
    Collapse,
    Group,
    Stack,
    Table,
    Text,
    Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown } from '@tabler/icons-react';
import React, { FC, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTableStyles } from '../../hooks/styles/useTableStyles';
import MantineIcon from '../common/MantineIcon';
import {
    camelCaseToFlat,
    Column,
    formatTime,
    getLogStatusIcon,
    getSchedulerIcon,
    getSchedulerLink,
    Log,
    SchedulerItem,
} from './SchedulersViewUtils';

interface LogsProps
    extends Pick<
        SchedulerWithLogs,
        'schedulers' | 'logs' | 'users' | 'charts' | 'dashboards'
    > {
    projectUuid: string;
}

const Logs: FC<LogsProps> = ({
    projectUuid,
    schedulers,
    logs,
    users,
    charts,
    dashboards,
}) => {
    const { classes, theme } = useTableStyles();
    const [opened, { toggle }] = useDisclosure(false);

    const columns = useMemo<Column[]>(() => {
        const getCurrentLogs = (item: SchedulerItem, targets: Log[]) => {
            return targets.filter(
                (target) => target.schedulerUuid === item.schedulerUuid,
            );
        };
        const getHandleScheduledDeliveryLogs = (
            item: SchedulerItem,
            targets: Log[],
        ) =>
            getCurrentLogs(item, targets).filter(
                (log) => log.task === 'handleScheduledDelivery',
            );

        const getSendNotificationLogs = (item: SchedulerItem, targets: Log[]) =>
            getCurrentLogs(item, targets).filter(
                (log) =>
                    log.task === 'sendEmailNotification' ||
                    log.task === 'sendSlackNotification',
            );
        return [
            {
                id: 'name',
                label: 'Name',
                cell: (item) => {
                    const user = users.find(
                        (u) => u.userUuid === item.createdBy,
                    );
                    const chartOrDashboard = item.savedChartUuid
                        ? charts.find(
                              (chart) =>
                                  chart.savedChartUuid === item.savedChartUuid,
                          )
                        : dashboards.find(
                              (dashboard) =>
                                  dashboard.dashboardUuid ===
                                  item.dashboardUuid,
                          );
                    return (
                        <Group noWrap>
                            {getSchedulerIcon(item, theme)}
                            <Stack spacing="two">
                                <Anchor
                                    unstyled
                                    component={Link}
                                    to={getSchedulerLink(item, projectUuid)}
                                    target="_blank"
                                >
                                    <Tooltip
                                        label={
                                            <Stack spacing="two" fz="xs">
                                                <Text color="gray.5">
                                                    Schedule type:{' '}
                                                    <Text color="white" span>
                                                        {item.format === 'csv'
                                                            ? 'CSV'
                                                            : 'Image'}
                                                    </Text>
                                                </Text>
                                                <Text color="gray.5">
                                                    Created by:{' '}
                                                    <Text color="white" span>
                                                        {user?.firstName}{' '}
                                                        {user?.lastName}
                                                    </Text>
                                                </Text>
                                            </Stack>
                                        }
                                    >
                                        <Text
                                            fw={600}
                                            lineClamp={1}
                                            sx={{
                                                overflowWrap: 'anywhere',
                                                '&:hover': {
                                                    textDecoration: 'underline',
                                                },
                                            }}
                                        >
                                            {item.name}
                                        </Text>
                                    </Tooltip>
                                </Anchor>
                                <Text fz="xs" color="gray.6">
                                    {chartOrDashboard?.name}
                                </Text>
                            </Stack>
                        </Group>
                    );
                },
                meta: {
                    style: {
                        width: 250,
                    },
                },
            },
            {
                id: 'jobs',
                label: 'Job',
                cell: (item) => {
                    const currentLogs = getCurrentLogs(item, logs);
                    const handleScheduledDeliveryLogs =
                        getHandleScheduledDeliveryLogs(item, logs);
                    const sendNotificationLogs = getSendNotificationLogs(
                        item,
                        logs,
                    );
                    return currentLogs.length > 0 ? (
                        <Stack spacing="md" fz="xs" fw={500}>
                            <Group spacing="two">
                                <Text>All jobs</Text>
                                <ActionIcon onClick={toggle} size="sm">
                                    <MantineIcon
                                        icon={IconChevronDown}
                                        color="black"
                                        size={13}
                                    />
                                </ActionIcon>
                            </Group>
                            <Collapse in={opened}>
                                <Stack spacing="md">
                                    <Text>
                                        {camelCaseToFlat(
                                            handleScheduledDeliveryLogs[0].task,
                                        )}
                                    </Text>
                                    <Text>
                                        {camelCaseToFlat(
                                            sendNotificationLogs[0].task,
                                        )}
                                    </Text>
                                </Stack>
                            </Collapse>
                        </Stack>
                    ) : (
                        <Text fz="xs" fw={500}>
                            No jobs yet
                        </Text>
                    );
                },
            },
            {
                id: 'deliveryScheduled',
                label: 'Delivery scheduled',
                cell: (item) => {
                    const currentLogs = getCurrentLogs(item, logs);
                    const handleScheduledDeliveryLogs =
                        getHandleScheduledDeliveryLogs(item, logs);
                    const sendNotificationLogs = getSendNotificationLogs(
                        item,
                        logs,
                    );
                    return currentLogs.length > 0 ? (
                        <Stack spacing="md" fz="xs" fw={500}>
                            <Text color="gray.6">
                                {formatTime(currentLogs[0].scheduledTime)}
                            </Text>
                            <Collapse in={opened}>
                                <Stack spacing="md">
                                    <Text color="gray.6">
                                        {formatTime(
                                            handleScheduledDeliveryLogs[0]
                                                .scheduledTime,
                                        )}
                                    </Text>
                                    <Text color="gray.6">
                                        {formatTime(
                                            sendNotificationLogs[0]
                                                .scheduledTime,
                                        )}
                                    </Text>
                                </Stack>
                            </Collapse>
                        </Stack>
                    ) : (
                        <Text fz="xs" color="gray.6">
                            -
                        </Text>
                    );
                },
            },
            {
                id: 'deliveryStarted',
                label: 'Delivery start',
                cell: (item) => {
                    const currentLogs = getCurrentLogs(item, logs);
                    const handleScheduledDeliveryLogs =
                        getHandleScheduledDeliveryLogs(item, logs);
                    const sendNotificationLogs = getSendNotificationLogs(
                        item,
                        logs,
                    );
                    return currentLogs.length > 0 ? (
                        <Stack spacing="md" fz="xs" fw={500}>
                            <Text color="gray.6">
                                {formatTime(currentLogs[0].createdAt)}
                            </Text>
                            <Collapse in={opened}>
                                <Stack spacing="md">
                                    <Text color="gray.6">
                                        {formatTime(
                                            handleScheduledDeliveryLogs[0]
                                                .createdAt,
                                        )}
                                    </Text>
                                    <Text color="gray.6">
                                        {formatTime(
                                            sendNotificationLogs[0].createdAt,
                                        )}
                                    </Text>
                                </Stack>
                            </Collapse>
                        </Stack>
                    ) : (
                        <Text fz="xs" color="gray.6">
                            -
                        </Text>
                    );
                },
            },
            {
                id: 'status',
                label: 'Status',
                cell: (item) => {
                    const currentLogs = getCurrentLogs(item, logs);
                    const handleScheduledDeliveryLogs =
                        getHandleScheduledDeliveryLogs(item, logs);
                    const sendNotificationLogs = getSendNotificationLogs(
                        item,
                        logs,
                    );
                    return (
                        <Center fz="xs" fw={500}>
                            {currentLogs.length > 0 ? (
                                <Stack>
                                    {getLogStatusIcon(currentLogs[0], theme)}
                                    <Collapse in={opened}>
                                        <Stack>
                                            {getLogStatusIcon(
                                                handleScheduledDeliveryLogs[0],
                                                theme,
                                            )}
                                            {getLogStatusIcon(
                                                sendNotificationLogs[0],
                                                theme,
                                            )}
                                        </Stack>
                                    </Collapse>
                                </Stack>
                            ) : (
                                <Text color="gray.6">-</Text>
                            )}
                        </Center>
                    );
                },
                meta: {
                    style: { width: '1px' },
                },
            },
        ];
    }, [users, charts, dashboards, projectUuid, logs, opened, toggle, theme]);

    return (
        <Table className={classes.root} highlightOnHover>
            <thead>
                <tr>
                    {columns.map((column) => {
                        return (
                            <th key={column.id} style={column?.meta?.style}>
                                {column?.label}
                            </th>
                        );
                    })}
                </tr>
            </thead>

            <tbody>
                {schedulers.map((item) => (
                    <tr key={item.schedulerUuid}>
                        {columns.map((column) => (
                            <td key={column.id}>{column.cell(item)}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default Logs;
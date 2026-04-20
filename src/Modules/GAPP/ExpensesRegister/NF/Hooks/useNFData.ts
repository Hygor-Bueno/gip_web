import { useState, useEffect, useCallback } from "react";
import { useMyContext } from "../../../../../Context/MainContext";
import {
  getNFExpenses,
  getAllNFs,
  getNFByNumber,
  postNFCoupon,
  deleteNFCoupon,
  resolveGappUser,
} from "../Adapters/AdaptersNF";
import {
  INFItem,
  IExpenseCoupon,
  INFFormValues,
  INFWithCoupons,
  NF_FORM_INITIAL,
} from "../Interfaces/InterfaceNF";

export interface UseNFDataReturn {
  gappUserId: number | null;
  /** Todos os cupons disponíveis para vinculação (filtrados: só os que têm coupon_number) */
  coupons: IExpenseCoupon[];
  nfList: INFItem[];
  formValues: INFFormValues;
  setFormValues: React.Dispatch<React.SetStateAction<INFFormValues>>;
  selectedCoupons: Set<string>;
  toggleCoupon: (id: string) => void;
  totalSelected: number;
  couponSearch: string;
  setCouponSearch: React.Dispatch<React.SetStateAction<string>>;
  filteredCoupons: IExpenseCoupon[];
  submitting: boolean;
  handleSubmit: () => Promise<void>;
  editNF: INFWithCoupons | null;
  openEdit: (nf: INFItem) => Promise<void>;
  closeEdit: () => void;
  loadingEdit: boolean;
  handleDeleteCoupon: (expen_id_fk: number) => Promise<void>;
  handleAddCoupons: (nf: INFWithCoupons, newCoupons: IExpenseCoupon[]) => Promise<void>;
  reload: () => Promise<void>;
}

export function useNFData(): UseNFDataReturn {
  const { userLog, setLoading } = useMyContext();

  const [gappUserId, setGappUserId] = useState<number | null>(null);
  const [coupons, setCoupons] = useState<IExpenseCoupon[]>([]);
  const [nfList, setNfList] = useState<INFItem[]>([]);
  const [formValues, setFormValues] = useState<INFFormValues>(NF_FORM_INITIAL);
  const [selectedCoupons, setSelectedCoupons] = useState<Set<string>>(new Set());
  const [couponSearch, setCouponSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editNF, setEditNF] = useState<INFWithCoupons | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  useEffect(() => {
    if (userLog?.id) {
      resolveGappUser(userLog.id).then((res) => {
        if (!res.error && res.data?.length) {
          setGappUserId(res.data[0].user_id);
        }
      });
    }
  }, [userLog?.id]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [couponsRes, nfRes] = await Promise.all([
        getNFExpenses(),
        getAllNFs(),
      ]);
      if (!couponsRes.error) {
        // Filtra apenas cupons que possuem coupon_number (igual ao legacy: d-none nos sem número)
        const withNumber = (couponsRes.data ?? []).filter(
          (c: IExpenseCoupon) => c.coupon_number
        );
        setCoupons(withNumber);
      }
      if (!nfRes.error) setNfList(nfRes.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Bug fix: Set<string> garante comparação correta independente do tipo vindo da API
  const toggleCoupon = useCallback((id: string) => {
    setSelectedCoupons((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const totalSelected = Array.from(selectedCoupons).reduce((sum, id) => {
    const coupon = coupons.find((c) => String(c.expen_id_fk) === id);
    return sum + Number(coupon?.total_value ?? 0);
  }, 0);

  const filteredCoupons = couponSearch
    ? coupons.filter((c) =>
        String(c.coupon_number)
          .toLowerCase()
          .includes(couponSearch.toLowerCase())
      )
    : coupons;

  const handleSubmit = useCallback(async () => {
    if (
      !formValues.number_nf ||
      !formValues.nf_key ||
      selectedCoupons.size === 0
    )
      return;

    setSubmitting(true);
    try {
      const selectedList = coupons.filter((c) =>
        selectedCoupons.has(String(c.expen_id_fk))
      );
      for (const coupon of selectedList) {
        await postNFCoupon({
          dt_delivery: formValues.dt_delivery,
          dt_issue: formValues.dt_issue,
          hr_exit: formValues.hr_exit,
          nf_key: formValues.nf_key,
          number_nf: formValues.number_nf,
          total_liq: Number(coupon.total_value),
          expen_id_fk: coupon.expen_id_fk,
          user_id_fk: gappUserId ?? 0,
        });
      }
      setFormValues(NF_FORM_INITIAL);
      setSelectedCoupons(new Set());
      setCouponSearch("");
      await reload();
    } finally {
      setSubmitting(false);
    }
  }, [formValues, selectedCoupons, coupons, gappUserId, reload]);

  const openEdit = useCallback(async (nf: INFItem) => {
    setLoadingEdit(true);
    try {
      const res = await getNFByNumber(nf.number_nf);
      if (!res.error && res.data) {
        // A API retorna res.data como array: [{ dt_issue, dt_delivery, hr_exit, cupons }]
        const item = Array.isArray(res.data) ? res.data[0] : res.data;
        setEditNF({
          ...nf,
          dt_issue:    item?.dt_issue    ?? "",
          dt_delivery: item?.dt_delivery ?? "",
          hr_exit:     item?.hr_exit     ?? "",
          cupons:      item?.cupons      ?? [],
        });
      }
    } finally {
      setLoadingEdit(false);
    }
  }, []);

  const closeEdit = useCallback(() => setEditNF(null), []);

  const handleDeleteCoupon = useCallback(
    async (expen_id_fk: number) => {
      await deleteNFCoupon(expen_id_fk);
      setEditNF((prev) =>
        prev
          ? {
              ...prev,
              cupons: prev.cupons.filter((c) => c.expen_id_fk !== expen_id_fk),
            }
          : null
      );
      await reload();
    },
    [reload]
  );

  const handleAddCoupons = useCallback(
    async (nf: INFWithCoupons, newCoupons: IExpenseCoupon[]) => {
      for (const coupon of newCoupons) {
        await postNFCoupon({
          dt_issue: nf.dt_issue,
          dt_delivery: nf.dt_delivery,
          hr_exit: nf.hr_exit,
          nf_key: nf.nf_key,
          number_nf: nf.number_nf,
          total_liq: Number(coupon.total_value),
          expen_id_fk: coupon.expen_id_fk,
          user_id_fk: gappUserId ?? 0,
        });
      }
      // Recarrega os cupons vinculados à NF (res.data é array)
      const res = await getNFByNumber(nf.number_nf);
      if (!res.error && res.data) {
        const item = Array.isArray(res.data) ? res.data[0] : res.data;
        setEditNF((prev) =>
          prev ? { ...prev, cupons: item?.cupons ?? [] } : null
        );
      }
      await reload();
    },
    [gappUserId, reload]
  );

  return {
    gappUserId,
    coupons,
    nfList,
    formValues,
    setFormValues,
    selectedCoupons,
    toggleCoupon,
    totalSelected,
    couponSearch,
    setCouponSearch,
    filteredCoupons,
    submitting,
    handleSubmit,
    editNF,
    openEdit,
    closeEdit,
    loadingEdit,
    handleDeleteCoupon,
    handleAddCoupons,
    reload,
  };
}

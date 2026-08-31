export type AssociationSettings = {
  associationName: string;
  address: string;
  city: string;
  contactEmail: string;
};

type AssociationLike = {
  name: string;
  address: string | null;
  city: string | null;
  contactEmail: string | null;
};

export function toSettings(
  association: AssociationLike
): AssociationSettings {
  return {
    associationName: association.name,
    address: association.address ?? "",
    city: association.city ?? "",
    contactEmail: association.contactEmail ?? "",
  };
}
